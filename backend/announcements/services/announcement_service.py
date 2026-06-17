from django.db import transaction
from rest_framework import status

from announcements.exceptions import AnnouncementServiceError
from announcements.models import Announcement
from announcements.selectors.announcement_selectors import AnnouncementSelector
from core.api.permissions import is_supervisor_or_admin


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
            title=data['title'],
            content=data['content'],
            created_by=user,
        )

        cls._broadcast_to_students(announcement)
        return AnnouncementSelector.get_by_id(announcement.pk)

    @classmethod
    @transaction.atomic
    def update(cls, *, user, announcement_id, data):
        cls._ensure_supervisor(user)

        announcement = AnnouncementSelector.get_by_id(announcement_id)

        if 'title' in data:
            announcement.title = data['title']
        if 'content' in data:
            announcement.content = data['content']

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

    @staticmethod
    def _broadcast_to_students(announcement):
        from core.models import Notification
        from users.models import Role, User

        students = User.objects.filter(
            role__name=Role.Name.STUDENT,
            is_active=True,
        ).only('id')

        notifications = [
            Notification(
                user_id=student.id,
                message=f'اطلاعیه جدید: {announcement.title}',
                related_request=None,
            )
            for student in students
        ]
        Notification.objects.bulk_create(notifications, batch_size=500)
