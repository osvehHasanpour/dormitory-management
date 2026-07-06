from django.db import transaction
from rest_framework import status

from core.api.permissions import is_student
from ideas.models import IdeaComplaint
from requests_app.exceptions import RequestServiceError
from requests_app.selectors.complaint_selectors import (
    MAX_ACTIVE_FEEDBACK_COUNT,
    ComplaintSelector,
)


class ComplaintService:
    @staticmethod
    def _ensure_student(user):
        if not is_student(user):
            raise RequestServiceError(
                'فقط دانشجویان می‌توانند درخواست ثبت کنند.',
                {'permission': ['ثبت درخواست فقط برای دانشجویان مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @staticmethod
    def _validate_category(category):
        if not category:
            raise RequestServiceError(
                'انتخاب دسته‌بندی الزامی است.',
                {'category': ['دسته‌بندی شکایت یا پیشنهاد الزامی است.']},
            )
        valid = {choice.value for choice in IdeaComplaint.Category}
        if category not in valid:
            raise RequestServiceError(
                'دسته‌بندی نامعتبر است.',
                {'category': ['مقدار دسته‌بندی معتبر نیست.']},
            )

    @classmethod
    def _ensure_active_limit(cls, user):
        active_count = ComplaintSelector.count_active_feedback(user)
        if active_count >= MAX_ACTIVE_FEEDBACK_COUNT:
            raise RequestServiceError(
                'حداکثر ۵ درخواست فعال (شکایت یا پیشنهاد) می‌توانید داشته باشید.',
                {
                    'limit': [
                        'لطفاً پس از پاسخ یا بسته شدن درخواست‌های قبلی، '
                        'درخواست جدید ثبت کنید.',
                    ],
                },
            )

    @classmethod
    @transaction.atomic
    def create_complaint(cls, *, user, data):
        cls._ensure_student(user)
        cls._ensure_active_limit(user)
        cls._validate_category(data.get('category'))
        return IdeaComplaint.objects.create(
            user=user,
            type=IdeaComplaint.Type.COMPLAINT,
            category=data['category'],
            title=data['title'],
            description=data['description'],
            status=IdeaComplaint.Status.PENDING,
        )

    @classmethod
    @transaction.atomic
    def create_suggestion(cls, *, user, data):
        cls._ensure_student(user)
        cls._ensure_active_limit(user)
        cls._validate_category(data.get('category'))
        return IdeaComplaint.objects.create(
            user=user,
            type=IdeaComplaint.Type.SUGGESTION,
            category=data['category'],
            title=data['title'],
            description=data['description'],
            status=IdeaComplaint.Status.PENDING,
        )
