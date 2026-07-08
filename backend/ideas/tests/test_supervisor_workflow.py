from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Notification
from ideas.models import IdeaComplaint
from users.models import Role, User


class SupervisorFeedbackTestBase(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(
            name=Role.Name.STUDENT,
            description='دانشجو',
        )
        self.supervisor_role = Role.objects.create(
            name=Role.Name.SUPERVISOR,
            description='سرپرست',
        )
        self.admin_role = Role.objects.create(
            name=Role.Name.ADMIN,
            description='مدیر',
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

        self.supervisor = User.objects.create(
            personnel_code='901234567',
            national_code='2234567890',
            first_name='رضا',
            last_name='سرپرست',
            role=self.supervisor_role,
        )
        self.supervisor.set_password('supervisor-pass')
        self.supervisor.save()

        self.admin = User.objects.create(
            personnel_code='801234567',
            national_code='3234567890',
            first_name='مدیر',
            last_name='سیستم',
            role=self.admin_role,
        )
        self.admin.set_password('admin-pass')
        self.admin.save()

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class SupervisorFeedbackWorkflowTests(SupervisorFeedbackTestBase):
    def _create_complaint(self, *, created_at=None):
        complaint = IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.COMPLAINT,
            category=IdeaComplaint.Category.SECURITY,
            title='سر و صدای شبانه',
            description='از ساعت ۲۳ تا ۱ بامداد موسیقی بلند پخش می‌شود.',
            status=IdeaComplaint.Status.PENDING,
        )
        if created_at is not None:
            IdeaComplaint.objects.filter(pk=complaint.pk).update(created_at=created_at)
            complaint.refresh_from_db()
        return complaint

    def _create_idea(self):
        return IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.IDEA,
            title='شب بازی‌های فکری',
            description='هر پنج‌شنبه شب مسابقه بازی فکری برگزار شود.',
            status=IdeaComplaint.Status.PENDING,
        )

    def test_student_cannot_access_supervisor_feedback_list(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('supervisor_feedback:feedback-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supervisor_can_list_feedback_with_type_filter(self):
        self._create_complaint()
        self._create_idea()

        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_feedback:feedback-list'),
            {'type': IdeaComplaint.Type.COMPLAINT},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        results = response.data['data']['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['type'], IdeaComplaint.Type.COMPLAINT)
        self.assertEqual(results[0]['category'], IdeaComplaint.Category.SECURITY)

    def test_idea_filter_includes_legacy_suggestions(self):
        self._create_complaint()
        idea = self._create_idea()
        legacy_suggestion = IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.SUGGESTION,
            title='کلاس زبان',
            description='کلاس مکالمه انگلیسی',
            status=IdeaComplaint.Status.PENDING,
        )

        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_feedback:feedback-list'),
            {'type': IdeaComplaint.Type.IDEA},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data['data']['results']]
        self.assertIn(idea.id, ids)
        self.assertIn(legacy_suggestion.id, ids)

    def test_legacy_suggestion_mapped_to_idea_in_payload(self):
        legacy_suggestion = IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.SUGGESTION,
            title='کلاس زبان',
            description='کلاس مکالمه انگلیسی',
            status=IdeaComplaint.Status.PENDING,
        )

        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_feedback:feedback-detail', kwargs={'pk': legacy_suggestion.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(data['type'], IdeaComplaint.Type.IDEA)
        self.assertEqual(data['type_display'], 'ایده')

    def test_supervisor_can_filter_by_category(self):
        self._create_complaint()
        IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.SUGGESTION,
            category=IdeaComplaint.Category.EDUCATION,
            title='کلاس زبان',
            description='کلاس مکالمه انگلیسی',
            status=IdeaComplaint.Status.PENDING,
        )

        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_feedback:feedback-list'),
            {'category': IdeaComplaint.Category.SECURITY},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['data']['results']]
        self.assertEqual(titles, ['سر و صدای شبانه'])

    def test_supervisor_responds_within_sla(self):
        complaint = self._create_complaint(
            created_at=timezone.now() - timedelta(hours=24),
        )

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse('supervisor_feedback:feedback-respond', kwargs={'pk': complaint.pk}),
            {'response_text': 'با دانشجویان خاطی صحبت شد.'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['status'], IdeaComplaint.Status.ANSWERED)
        self.assertTrue(response.data['data']['responded_within_sla'])
        self.assertEqual(
            response.data['data']['responded_by']['personnel_code'],
            self.supervisor.personnel_code,
        )

        complaint.refresh_from_db()
        self.assertEqual(complaint.responded_by_id, self.supervisor.id)
        self.assertIsNotNone(complaint.responded_at)
        self.assertTrue(complaint.responded_within_sla)

    def test_supervisor_responds_after_sla_deadline(self):
        complaint = self._create_complaint(
            created_at=timezone.now() - timedelta(hours=80),
        )

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse('supervisor_feedback:feedback-respond', kwargs={'pk': complaint.pk}),
            {'response_text': 'پاسخ با تأخیر ثبت شد.'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['data']['responded_within_sla'])

        complaint.refresh_from_db()
        self.assertFalse(complaint.responded_within_sla)

    def test_response_creates_notification_for_student(self):
        complaint = self._create_complaint()

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse('supervisor_feedback:feedback-respond', kwargs={'pk': complaint.pk}),
            {'response_text': 'مورد بررسی و پیگیری شد.'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        notification = Notification.objects.get(
            user=self.student,
            related_idea_complaint_id=complaint.pk,
        )
        self.assertIn(complaint.title, notification.message)
        self.assertFalse(notification.is_read)

    def test_supervisor_approves_idea_and_student_can_vote(self):
        idea = self._create_idea()

        self.auth_as(self.supervisor)
        review_response = self.client.patch(
            reverse('supervisor_feedback:idea-review', kwargs={'pk': idea.pk}),
            {'action': 'approve'},
            format='json',
        )
        self.assertEqual(review_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            review_response.data['data']['status'],
            IdeaComplaint.Status.REVIEWED,
        )

        other_student = User.objects.create(
            personnel_code='401234568',
            national_code='1234567891',
            first_name='مریم',
            last_name='احمدی',
            role=self.student_role,
        )
        self.auth_as(other_student)
        list_response = self.client.get(reverse('ideas:idea-list-create'))
        titles = [item['title'] for item in list_response.data['data']['results']]
        self.assertIn(idea.title, titles)

    def test_supervisor_rejects_idea_requires_reason(self):
        idea = self._create_idea()

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse('supervisor_feedback:idea-review', kwargs={'pk': idea.pk}),
            {'action': 'reject'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('response_text', response.data['errors'])

        idea.refresh_from_db()
        self.assertEqual(idea.status, IdeaComplaint.Status.PENDING)

    def test_admin_can_respond_to_feedback(self):
        complaint = self._create_complaint()

        self.auth_as(self.admin)
        response = self.client.patch(
            reverse('supervisor_feedback:feedback-respond', kwargs={'pk': complaint.pk}),
            {'response_text': 'پاسخ مدیر سیستم.'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['data']['responded_by']['personnel_code'],
            self.admin.personnel_code,
        )

    def test_complaint_create_requires_category(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('complaints:complaint-create'),
            {
                'title': 'مشکل گرمایش',
                'description': 'شوفاژ کار نمی‌کند.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', response.data['errors'])

    def test_student_can_create_complaint_with_category(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('complaints:complaint-create'),
            {
                'title': 'مشکل گرمایش',
                'description': 'شوفاژ کار نمی‌کند.',
                'category': IdeaComplaint.Category.MAINTENANCE,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data['data']['category'],
            IdeaComplaint.Category.MAINTENANCE,
        )

    def test_student_sees_response_after_supervisor_responds(self):
        complaint = self._create_complaint()

        self.auth_as(self.supervisor)
        self.client.patch(
            reverse('supervisor_feedback:feedback-respond', kwargs={'pk': complaint.pk}),
            {'response_text': 'پیگیری انجام شد.'},
            format='json',
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse('complaints:complaint-detail', kwargs={'pk': complaint.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['status'], IdeaComplaint.Status.ANSWERED)
        self.assertEqual(response.data['data']['response_text'], 'پیگیری انجام شد.')
        self.assertTrue(response.data['data']['responded_within_sla'])

    def test_mark_under_review_changes_status(self):
        complaint = self._create_complaint()

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse('supervisor_feedback:feedback-mark-review', kwargs={'pk': complaint.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['status'], IdeaComplaint.Status.REVIEWED)

    def test_reject_feedback_requires_reason(self):
        complaint = self._create_complaint()

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse('supervisor_feedback:feedback-reject', kwargs={'pk': complaint.pk}),
            {'response_text': ''},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        reject_response = self.client.patch(
            reverse('supervisor_feedback:feedback-reject', kwargs={'pk': complaint.pk}),
            {'response_text': 'شکایت تکراری است.'},
            format='json',
        )
        self.assertEqual(reject_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            reject_response.data['data']['status'],
            IdeaComplaint.Status.REJECTED,
        )
