from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from ideas.models import IdeaComplaint, Vote
from users.models import Role, User


class IdeasWorkflowTests(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(
            name=Role.Name.STUDENT,
            description='دانشجو',
        )
        self.author = User.objects.create(
            personnel_code='401234567',
            national_code='1234567890',
            first_name='علی',
            last_name='رضایی',
            role=self.student_role,
        )
        self.author.set_password('student-pass')
        self.author.save()

        self.voter = User.objects.create(
            personnel_code='401234568',
            national_code='1234567891',
            first_name='مریم',
            last_name='احمدی',
            role=self.student_role,
        )
        self.voter.set_password('student-pass')
        self.voter.save()

        self.idea = IdeaComplaint.objects.create(
            user=self.author,
            type=IdeaComplaint.Type.IDEA,
            title='شب بازی‌های فکری',
            description='هر پنج‌شنبه شب مسابقه بازی فکری برگزار شود.',
            status=IdeaComplaint.Status.REVIEWED,
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_vote_toggle_replace_and_remove_workflow(self):
        self.auth_as(self.voter)
        vote_url = reverse('ideas:idea-vote', kwargs={'pk': self.idea.pk})

        up_response = self.client.post(vote_url, {'vote_type': 'up'}, format='json')
        self.assertEqual(up_response.data['data']['user_vote'], Vote.VoteType.UP)
        self.assertEqual(up_response.data['data']['likes_count'], 1)

        replace_response = self.client.post(
            vote_url,
            {'vote_type': 'down'},
            format='json',
        )
        self.assertEqual(replace_response.data['message'], 'رأی شما با موفقیت به‌روزرسانی شد.')
        self.assertEqual(replace_response.data['data']['user_vote'], Vote.VoteType.DOWN)
        self.assertEqual(replace_response.data['data']['likes_count'], 0)
        self.assertEqual(replace_response.data['data']['dislikes_count'], 1)

        remove_response = self.client.post(
            vote_url,
            {'vote_type': 'down'},
            format='json',
        )
        self.assertEqual(remove_response.data['message'], 'رأی شما با موفقیت حذف شد.')
        self.assertIsNone(remove_response.data['data']['user_vote'])
        self.assertEqual(remove_response.data['data']['dislikes_count'], 0)

        self.idea.refresh_from_db()
        self.assertEqual(self.idea.upvotes, 0)
        self.assertFalse(Vote.objects.filter(user=self.voter, idea=self.idea).exists())

    def test_ordering_by_most_votes(self):
        idea_low = IdeaComplaint.objects.create(
            user=self.author,
            type=IdeaComplaint.Type.IDEA,
            title='ایده کم‌رأی',
            description='توضیح',
            status=IdeaComplaint.Status.REVIEWED,
        )
        idea_high = IdeaComplaint.objects.create(
            user=self.author,
            type=IdeaComplaint.Type.IDEA,
            title='ایده پُررأی',
            description='توضیح',
            status=IdeaComplaint.Status.REVIEWED,
        )
        Vote.objects.create(user=self.voter, idea=idea_low, vote_type=Vote.VoteType.UP)
        for index in range(3):
            voter = User.objects.create(
                personnel_code=f'40123457{index}',
                national_code=f'223456789{index}',
                first_name='رأی',
                last_name='دهنده',
                role=self.student_role,
            )
            Vote.objects.create(user=voter, idea=idea_high, vote_type=Vote.VoteType.UP)
        idea_high.upvotes = 3
        idea_high.save(update_fields=['upvotes'])

        self.auth_as(self.voter)
        response = self.client.get(
            reverse('ideas:idea-list-create'),
            {'ordering': 'most_votes'},
        )

        titles = [item['title'] for item in response.data['data']['results']]
        self.assertEqual(titles[0], idea_high.title)
