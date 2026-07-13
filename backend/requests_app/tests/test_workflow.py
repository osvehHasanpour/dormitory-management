from django.test import TestCase

from ideas.models import IdeaComplaint
from requests_app.exceptions import RequestServiceError
from requests_app.models import (
    MaintenanceRequest,
    RequestBase,
    RequestStatusHistory,
)
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
            category='facilities',
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
            category='facilities',
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
            category='facilities',
        )

        with self.assertRaises(RequestServiceError):
            RequestService.change_status(
                actor=self.supervisor,
                request_id=request_obj.pk,
                new_status=RequestBase.Status.IN_PROGRESS,
            )

    def test_rejection_reason_required_in_service(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی لوله',
            location='بلوک الف',
            category='facilities',
        )

        with self.assertRaises(RequestServiceError) as ctx:
            RequestService.change_status(
                actor=self.supervisor,
                request_id=request_obj.pk,
                new_status=RequestBase.Status.REJECTED,
                rejection_reason='',
            )

        self.assertIn('rejection_reason', ctx.exception.errors)

    def test_record_status_history_on_change_status(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی لوله',
            location='بلوک الف',
            category='facilities',
        )

        RequestService.change_status(
            actor=self.supervisor,
            request_id=request_obj.pk,
            new_status=RequestBase.Status.IN_PROGRESS,
            comment='بررسی اولیه',
        )

        history = RequestStatusHistory.objects.filter(request_id=request_obj.pk)
        self.assertEqual(history.count(), 1)
        entry = history.first()
        self.assertEqual(entry.previous_status, RequestBase.Status.PENDING)
        self.assertEqual(entry.new_status, RequestBase.Status.IN_PROGRESS)
        self.assertEqual(entry.acting_supervisor_id, self.supervisor.id)
        self.assertEqual(entry.comment, 'بررسی اولیه')

    def test_pending_to_approved_allowed_for_cleaning(self):
        validate_transition(
            RequestBase.Status.PENDING,
            RequestBase.Status.APPROVED,
            request_type=RequestBase.RequestType.CLEANING,
        )

    def test_pending_to_approved_blocked_for_maintenance(self):
        with self.assertRaises(RequestServiceError):
            validate_transition(
                RequestBase.Status.PENDING,
                RequestBase.Status.APPROVED,
                request_type=RequestBase.RequestType.MAINTENANCE,
            )

    def test_create_cleaning_records_initial_history(self):
        request_obj = RequestService.create_cleaning(
            user=self.student,
            data={
                'description': 'نظافت راهرو',
                'location': 'بلوک ب',
                'preferred_date': '2026-06-20',
            },
        )

        history = RequestStatusHistory.objects.filter(request_id=request_obj.pk)
        self.assertEqual(history.count(), 1)
        self.assertIsNone(history.first().previous_status)
        self.assertEqual(history.first().new_status, RequestBase.Status.PENDING)

    def test_cleaning_active_limit_enforced_in_service(self):
        for index in range(3):
            RequestService.create_cleaning(
                user=self.student,
                data={
                    'description': f'نظافت {index + 1}',
                    'location': f'بلوک {index + 1}',
                    'preferred_date': f'2026-07-{index + 1:02d}',
                },
            )

        with self.assertRaises(RequestServiceError) as ctx:
            RequestService.create_cleaning(
                user=self.student,
                data={
                    'description': 'نظافت چهارم',
                    'location': 'بلوک ۴',
                    'preferred_date': '2026-07-10',
                },
            )

        self.assertIn('limit', ctx.exception.errors)


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

    def _feedback_payload(self, *, title, description, category=None):
        """ComplaintService validates category; include a valid choice in every submission."""
        return {
            'title': title,
            'description': description,
            'category': category or IdeaComplaint.Category.OTHER,
        }

    def test_max_five_active_feedback_combined_limit(self):
        for index in range(5):
            ComplaintService.create_complaint(
                user=self.student,
                data=self._feedback_payload(
                    title=f'شکایت فعال {index + 1}',
                    description='توضیح نمونه برای شکایت.',
                ),
            )

        with self.assertRaises(RequestServiceError) as ctx:
            ComplaintService.create_suggestion(
                user=self.student,
                data=self._feedback_payload(
                    title='پیشنهاد ششم',
                    description='این پیشنهاد باید رد شود.',
                ),
            )

        self.assertIn('حداکثر ۵', ctx.exception.message)

        first_item = IdeaComplaint.objects.filter(user=self.student).first()
        first_item.status = IdeaComplaint.Status.ANSWERED
        first_item.save(update_fields=['status'])

        suggestion = ComplaintService.create_suggestion(
            user=self.student,
            data=self._feedback_payload(
                title='نصب اینverter در لاندری',
                description='برای کاهش مصرف برق لاندری از اینverter استفاده شود.',
                category=IdeaComplaint.Category.FACILITIES,
            ),
        )
        self.assertEqual(suggestion.type, IdeaComplaint.Type.SUGGESTION)
