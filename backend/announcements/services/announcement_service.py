from django.db import transaction
from rest_framework import status

from announcements.exceptions import AnnouncementServiceError
from announcements.models import Announcement
from announcements.selectors.announcement_selectors import AnnouncementSelector
from core.api.permissions import is_supervisor_or_admin
from core.services.notification_service import NotificationService


class AnnouncementService:
    @staticmethod
    def _ensure_supervisor(user):
        if not is_supervisor_or_admin(user):
            raise AnnouncementServiceError(
                'فقط سرپرست یا مدیر می‌تواند اطلاعیه مدیریت کند.',
                {'permission': ['این عملیات فقط برای سرپرست یا مدیر مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @classmethod
    @transaction.atomic
    def create(cls, *, user, data):
        cls._ensure_supervisor(user)

        announcement = Announcement.objects.create(
            title=data['title'].strip(),
            content=data['content'].strip(),
            created_by=user,
        )

        NotificationService.broadcast_to_students(
            message=f'اطلاعیه جدید: {announcement.title}',
        )
        return AnnouncementSelector.get_by_id(announcement.pk)

    @classmethod
    @transaction.atomic
    def update(cls, *, user, announcement_id, data):
        cls._ensure_supervisor(user)

        if not data:
            raise AnnouncementServiceError(
                'حداقل یکی از فیلدهای عنوان یا محتوا باید ارسال شود.',
                {'detail': ['هیچ فیلدی برای به‌روزرسانی ارسال نشده است.']},
            )

        announcement = AnnouncementSelector.get_by_id(announcement_id)

        if 'title' in data:
            announcement.title = data['title'].strip()
        if 'content' in data:
            announcement.content = data['content'].strip()

        update_fields = [k for k in ('title', 'content') if k in data]
        if update_fields:
            announcement.save(update_fields=update_fields)

        return AnnouncementSelector.get_by_id(announcement.pk)

    @classmethod
    @transaction.atomic
    def deactivate(cls, *, user, announcement_id):
        cls._ensure_supervisor(user)

        announcement = AnnouncementSelector.get_by_id(announcement_id)

        if not announcement.is_active:
            raise AnnouncementServiceError(
                'این اطلاعیه قبلاً غیرفعال شده است.',
                {'status': ['اطلاعیه از قبل غیرفعال است.']},
                status.HTTP_400_BAD_REQUEST,
            )

        announcement.is_active = False
        announcement.save(update_fields=['is_active'])
        return AnnouncementSelector.get_by_id(announcement.pk)
