from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from ideas.models import IdeaComplaint, Vote
from users.models import Role, User


class IdeasAPITestBase(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(
            name=Role.Name.STUDENT,
            description='دانشجو',
        )
        self.student = User.objects.create(
            personnel_code='401234567',
            national_code='1234567890',
            first_name='علی',
            last_name='رضایی',
            role=self.student_role,
        )
        self.student.set_password('student-pass')
        self.student.save()

        self.other_student = User.objects.create(
            personnel_code='401234568',
            national_code='1234567891',
            first_name='مریم',
            last_name='احمدی',
            role=self.student_role,
        )
        self.other_student.set_password('student-pass')
        self.other_student.save()

        self.reviewed_idea = IdeaComplaint.objects.create(
            user=self.other_student,
            type=IdeaComplaint.Type.IDEA,
            title='راه‌اندازی باشگاه بدنسازی',
            description='پیشنهاد می‌کنم در زیرزمین یک باشگاه کوچک راه‌اندازی شود.',
            status=IdeaComplaint.Status.REVIEWED,
        )
        self.pending_idea = IdeaComplaint.objects.create(
            user=self.other_student,
            type=IdeaComplaint.Type.IDEA,
            title='ایده در انتظار تأیید',
            description='این ایده هنوز تأیید نشده است.',
            status=IdeaComplaint.Status.PENDING,
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class IdeasRESTAPITests(IdeasAPITestBase):
    def test_student_can_submit_idea(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('ideas:idea-list-create'),
            {
                'title': 'ایجاد فضای مطالعه شبانه',
                'description': 'یک سالن مطالعه ۲۴ ساعته در بلوک الف ایجاد شود.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], 'ایده شما با موفقیت ثبت شد.')
        self.assertEqual(response.data['data']['status'], IdeaComplaint.Status.PENDING)
        self.assertTrue(response.data['data']['is_owner'])

    def test_public_list_shows_only_reviewed_ideas(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('ideas:idea-list-create'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['data']['results']]
        self.assertIn(self.reviewed_idea.title, titles)
        self.assertNotIn(self.pending_idea.title, titles)

    def test_my_ideas_includes_pending(self):
        own_idea = IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.IDEA,
            title='کتابخانه سیار',
            description='یک قفسه کتاب در هر طبقه قرار دهید.',
            status=IdeaComplaint.Status.PENDING,
        )
        self.auth_as(self.student)
        response = self.client.get(reverse('ideas:my-ideas'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['data']['results']]
        self.assertIn(own_idea.title, titles)

    def test_non_owner_cannot_view_pending_idea_detail(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('ideas:idea-detail', kwargs={'pk': self.pending_idea.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_owner_can_view_pending_idea_detail(self):
        self.auth_as(self.other_student)
        response = self.client.get(
            reverse('ideas:idea-detail', kwargs={'pk': self.pending_idea.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['title'], self.pending_idea.title)

    def test_student_can_vote_on_reviewed_idea(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('ideas:idea-vote', kwargs={'pk': self.reviewed_idea.pk}),
            {'vote_type': 'up'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['user_vote'], Vote.VoteType.UP)
        self.assertEqual(response.data['data']['likes_count'], 1)
        self.reviewed_idea.refresh_from_db()
        self.assertEqual(self.reviewed_idea.upvotes, 1)

    def test_cannot_vote_on_own_idea(self):
        self.auth_as(self.other_student)
        response = self.client.post(
            reverse('ideas:idea-vote', kwargs={'pk': self.reviewed_idea.pk}),
            {'vote_type': 'up'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_request_is_rejected(self):
        response = self.client.get(reverse('ideas:idea-list-create'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_public_list_includes_supervisor_response_for_non_owner(self):
        self.reviewed_idea.supervisor_response = 'این ایده پس از بررسی تأیید شد.'
        self.reviewed_idea.save(update_fields=['supervisor_response'])

        self.auth_as(self.student)
        response = self.client.get(reverse('ideas:idea-list-create'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        idea_data = next(
            item for item in response.data['data']['results']
            if item['id'] == self.reviewed_idea.pk
        )
        self.assertEqual(idea_data['supervisor_response'], 'این ایده پس از بررسی تأیید شد.')
        self.assertFalse(idea_data['is_owner'])

    def test_public_list_ordering_by_most_votes(self):
        low_votes = IdeaComplaint.objects.create(
            user=self.other_student,
            type=IdeaComplaint.Type.IDEA,
            title='ایده کم‌رأی',
            description='توضیحات',
            status=IdeaComplaint.Status.REVIEWED,
        )
        high_votes = IdeaComplaint.objects.create(
            user=self.other_student,
            type=IdeaComplaint.Type.IDEA,
            title='ایده پررأی',
            description='توضیحات',
            status=IdeaComplaint.Status.REVIEWED,
        )
        Vote.objects.create(user=self.student, idea=high_votes, vote_type=Vote.VoteType.UP)

        self.auth_as(self.student)
        response = self.client.get(
            reverse('ideas:idea-list-create'),
            {'ordering': 'most_votes'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['data']['results']]
        self.assertEqual(titles.index('ایده پررأی'), 0)
        self.assertLess(titles.index('ایده پررأی'), titles.index('ایده کم‌رأی'))
