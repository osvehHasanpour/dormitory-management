from django.test import TestCase

from ideas.models import IdeaComplaint, Vote
from requests_app.exceptions import RequestServiceError
from requests_app.models import MaintenanceRequest, RequestBase
from requests_app.services.complaint_service import ComplaintService
from requests_app.services.request_service import RequestService
from requests_app.services.state_machine import validate_transition
from users.models import Role, User


class RequestWorkflowTests(TestCase):
    def setUp(self):
        self.student_role = Role.objects.create(name=Role.Name.STUDENT, description='دانشجو')
        self.supervisor_role = Role.objects.create(
            name=Role.Name.SUPERVISOR,
            description='سرپرست',
        )
        self.student = User.objects.create(
            personnel_code='401234567',
            national_code='1234567890',
            first_name='علی',
            last_name='رضایی',
            role=self.student_role,
        )
        self.supervisor = User.objects.create(
            personnel_code='9001001',
            national_code='2234567890',
            first_name='حسین',
            last_name='کریمی',
            role=self.supervisor_role,
        )

    def test_valid_pending_to_in_progress_transition(self):
        validate_transition(
            RequestBase.Status.PENDING,
            RequestBase.Status.IN_PROGRESS,
        )

    def test_invalid_pending_to_completed_transition(self):
        with self.assertRaises(RequestServiceError) as ctx:
            validate_transition(
                RequestBase.Status.PENDING,
                RequestBase.Status.COMPLETED,
            )

        self.assertIn('مجاز نیست', ctx.exception.message)

    def test_change_status_sets_handled_by(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی لوله',
            location='بلوک الف',
        )

        updated = RequestService.change_status(
            actor=self.supervisor,
            request_id=request_obj.pk,
            new_status=RequestBase.Status.IN_PROGRESS,
        )

        self.assertEqual(updated.status, RequestBase.Status.IN_PROGRESS)
        self.assertEqual(updated.handled_by_id, self.supervisor.id)

    def test_student_cannot_change_status(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی لوله',
            location='بلوک الف',
        )

        with self.assertRaises(RequestServiceError) as ctx:
            RequestService.change_status(
                actor=self.student,
                request_id=request_obj.pk,
                new_status=RequestBase.Status.IN_PROGRESS,
            )

        self.assertEqual(ctx.exception.status_code, 403)

    def test_rejected_status_is_terminal(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            status=RequestBase.Status.REJECTED,
            description='خرابی لوله',
            location='بلوک الف',
        )

        with self.assertRaises(RequestServiceError):
            RequestService.change_status(
                actor=self.supervisor,
                request_id=request_obj.pk,
                new_status=RequestBase.Status.IN_PROGRESS,
            )


class FeedbackWorkflowTests(TestCase):
    def setUp(self):
        self.student_role = Role.objects.create(name=Role.Name.STUDENT, description='دانشجو')
        self.student = User.objects.create(
            personnel_code='401234567',
            national_code='1234567890',
            first_name='علی',
            last_name='رضایی',
            role=self.student_role,
        )

    def test_max_five_active_feedback_combined_limit(self):
        for index in range(5):
            ComplaintService.create_complaint(
                user=self.student,
                data={
                    'title': f'شکایت فعال {index + 1}',
                    'description': 'توضیح نمونه برای شکایت.',
                },
            )

        with self.assertRaises(RequestServiceError) as ctx:
            ComplaintService.create_suggestion(
                user=self.student,
                data={
                    'title': 'پیشنهاد ششم',
                    'description': 'این پیشنهاد باید رد شود.',
                },
            )

        self.assertIn('حداکثر ۵', ctx.exception.message)

        first_item = IdeaComplaint.objects.filter(user=self.student).first()
        first_item.status = IdeaComplaint.Status.ANSWERED
        first_item.save(update_fields=['status'])

        suggestion = ComplaintService.create_suggestion(
            user=self.student,
            data={
                'title': 'نصب اینverter در لاندری',
                'description': 'برای کاهش مصرف برق لاندری از اینverter استفاده شود.',
            },
        )
        self.assertEqual(suggestion.type, IdeaComplaint.Type.SUGGESTION)
