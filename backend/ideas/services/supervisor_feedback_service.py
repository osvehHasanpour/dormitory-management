from django.db import transaction
from django.utils import timezone
from rest_framework import status

from core.api.permissions import is_supervisor_or_admin
from core.models import Notification
from ideas.exceptions import IdeaServiceError
from ideas.models import IdeaComplaint
from ideas.selectors.supervisor_feedback_selectors import SupervisorFeedbackSelector


class SupervisorFeedbackService:
    @staticmethod
    def _ensure_supervisor_or_admin(user):
        if not is_supervisor_or_admin(user):
            raise IdeaServiceError(
                'شما مجوز انجام این عملیات را ندارید.',
                {'permission': ['این عملیات فقط برای سرپرست یا مدیر مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @staticmethod
    def _validate_response_text(response_text):
        if not response_text or not response_text.strip():
            raise IdeaServiceError(
                'متن پاسخ الزامی است.',
                {'response_text': ['متن پاسخ نمی‌تواند خالی باشد.']},
            )

    @classmethod
    def _apply_response(cls, *, item, actor, response_text):
        now = timezone.now()
        item.supervisor_response = response_text.strip()
        item.responded_by = actor
        item.responded_at = now
        item.responded_within_sla = IdeaComplaint.compute_sla_compliance(
            created_at=item.created_at,
            responded_at=now,
        )
        return now

    @classmethod
    def _notify_student(cls, *, item):
        Notification.objects.create(
            user=item.user,
            message=f'پاسخ سرپرست به «{item.title}» ثبت شد.',
            related_idea_complaint=item,
        )

    @classmethod
    @transaction.atomic
    def review_idea(cls, *, actor, item_id, action, response_text=''):
        cls._ensure_supervisor_or_admin(actor)

        item = SupervisorFeedbackSelector.get_for_supervisor_update(item_id)

        if item.type != IdeaComplaint.Type.IDEA:
            raise IdeaServiceError(
                'این عملیات فقط برای ایده‌ها مجاز است.',
                {'type': ['عملیات بررسی فقط برای ایده‌ها قابل انجام است.']},
            )

        if item.status != IdeaComplaint.Status.PENDING:
            raise IdeaServiceError(
                'فقط ایده‌های در انتظار بررسی قابل تأیید یا رد هستند.',
                {'status': ['وضعیت فعلی ایده اجازه بررسی را نمی‌دهد.']},
            )

        if action not in ('approve', 'reject'):
            raise IdeaServiceError(
                'عملیات بررسی نامعتبر است.',
                {'action': ['مقدار action باید approve یا reject باشد.']},
            )

        update_fields = ['status', 'updated_at']

        if action == 'approve':
            item.status = IdeaComplaint.Status.REVIEWED
            if response_text.strip():
                cls._apply_response(item=item, actor=actor, response_text=response_text)
                update_fields.extend([
                    'supervisor_response',
                    'responded_by',
                    'responded_at',
                    'responded_within_sla',
                ])
                cls._notify_student(item=item)
        else:
            if not response_text.strip():
                raise IdeaServiceError(
                    'در صورت رد ایده، ذکر دلیل الزامی است.',
                    {'response_text': ['در صورت رد ایده، ذکر دلیل الزامی است.']},
                )
            item.status = IdeaComplaint.Status.REJECTED
            cls._apply_response(item=item, actor=actor, response_text=response_text)
            update_fields.extend([
                'supervisor_response',
                'responded_by',
                'responded_at',
                'responded_within_sla',
            ])
            cls._notify_student(item=item)

        item.save(update_fields=update_fields)
        return SupervisorFeedbackSelector.get_detail_for_supervisor(item.pk)

    @classmethod
    @transaction.atomic
    def respond_to_feedback(cls, *, actor, item_id, response_text):
        cls._ensure_supervisor_or_admin(actor)
        cls._validate_response_text(response_text)

        item = SupervisorFeedbackSelector.get_for_supervisor_update(item_id)

        if item.type not in (
            IdeaComplaint.Type.COMPLAINT,
            IdeaComplaint.Type.SUGGESTION,
        ):
            raise IdeaServiceError(
                'این عملیات فقط برای شکایت و پیشنهاد مجاز است.',
                {'type': ['پاسخ‌دهی فقط برای شکایت و پیشنهاد قابل انجام است.']},
            )

        if item.status not in (
            IdeaComplaint.Status.PENDING,
            IdeaComplaint.Status.REVIEWED,
        ):
            raise IdeaServiceError(
                'این مورد قبلاً پاسخ داده شده یا بسته شده است.',
                {'status': ['وضعیت فعلی اجازه پاسخ‌دهی را نمی‌دهد.']},
            )

        item.status = IdeaComplaint.Status.ANSWERED
        cls._apply_response(item=item, actor=actor, response_text=response_text)
        item.save(update_fields=[
            'status',
            'supervisor_response',
            'responded_by',
            'responded_at',
            'responded_within_sla',
            'updated_at',
        ])
        cls._notify_student(item=item)

        return SupervisorFeedbackSelector.get_detail_for_supervisor(item.pk)

    @classmethod
    @transaction.atomic
    def reject_feedback(cls, *, actor, item_id, response_text=''):
        cls._ensure_supervisor_or_admin(actor)

        item = SupervisorFeedbackSelector.get_for_supervisor_update(item_id)

        if item.type not in (
            IdeaComplaint.Type.COMPLAINT,
            IdeaComplaint.Type.SUGGESTION,
        ):
            raise IdeaServiceError(
                'این عملیات فقط برای شکایت و پیشنهاد مجاز است.',
                {'type': ['رد کردن فقط برای شکایت و پیشنهاد قابل انجام است.']},
            )

        if item.status not in (
            IdeaComplaint.Status.PENDING,
            IdeaComplaint.Status.REVIEWED,
        ):
            raise IdeaServiceError(
                'این مورد قبلاً پاسخ داده شده یا بسته شده است.',
                {'status': ['وضعیت فعلی اجازه رد را نمی‌دهد.']},
            )

        if not response_text.strip():
            raise IdeaServiceError(
                'در صورت رد، ذکر دلیل الزامی است.',
                {'response_text': ['در صورت رد، ذکر دلیل الزامی است.']},
            )

        item.status = IdeaComplaint.Status.REJECTED
        cls._apply_response(item=item, actor=actor, response_text=response_text)
        item.save(update_fields=[
            'status',
            'supervisor_response',
            'responded_by',
            'responded_at',
            'responded_within_sla',
            'updated_at',
        ])
        cls._notify_student(item=item)

        return SupervisorFeedbackSelector.get_detail_for_supervisor(item.pk)

    @classmethod
    @transaction.atomic
    def mark_under_review(cls, *, actor, item_id):
        cls._ensure_supervisor_or_admin(actor)

        item = SupervisorFeedbackSelector.get_for_supervisor_update(item_id)

        if item.type not in (
            IdeaComplaint.Type.COMPLAINT,
            IdeaComplaint.Type.SUGGESTION,
        ):
            raise IdeaServiceError(
                'این عملیات فقط برای شکایت و پیشنهاد مجاز است.',
                {'type': ['علامت‌گذاری «در حال بررسی» فقط برای شکایت و پیشنهاد است.']},
            )

        if item.status != IdeaComplaint.Status.PENDING:
            raise IdeaServiceError(
                'فقط موارد در انتظار پاسخ قابل علامت‌گذاری به «در حال بررسی» هستند.',
                {'status': ['وضعیت فعلی اجازه این تغییر را نمی‌دهد.']},
            )

        item.status = IdeaComplaint.Status.REVIEWED
        item.save(update_fields=['status', 'updated_at'])

        return SupervisorFeedbackSelector.get_detail_for_supervisor(item.pk)
