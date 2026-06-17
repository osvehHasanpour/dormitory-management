from rest_framework import status

from announcements.exceptions import AnnouncementServiceError
from announcements.models import Announcement


class AnnouncementSelector:
    @classmethod
    def _base_queryset(cls):
        return Announcement.objects.select_related('created_by', 'created_by__role')

    @classmethod
    def get_active_list(cls):
        return cls._base_queryset().filter(is_active=True).order_by('-created_at')

    @classmethod
    def get_all_list(cls):
        return cls._base_queryset().order_by('-created_at')

    @classmethod
    def get_by_id(cls, announcement_id):
        try:
            return cls._base_queryset().get(pk=announcement_id)
        except Announcement.DoesNotExist as exc:
            raise AnnouncementServiceError(
                'اطلاعیه مورد نظر یافت نشد.',
                {'id': ['شناسه اطلاعیه نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def build_payload(cls, announcement):
        return {
            'id': announcement.id,
            'title': announcement.title,
            'content': announcement.content,
            'is_active': announcement.is_active,
            'created_at': announcement.created_at,
            'created_by': {
                'id': announcement.created_by_id,
                'personnel_code': announcement.created_by.personnel_code,
                'first_name': announcement.created_by.first_name,
                'last_name': announcement.created_by.last_name,
            },
        }
