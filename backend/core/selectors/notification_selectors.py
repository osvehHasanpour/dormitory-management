from rest_framework import status

from core.exceptions import NotificationServiceError
from core.models import Notification


class NotificationSelector:
    @classmethod
    def _base_queryset(cls, user):
        return Notification.objects.filter(user=user).select_related(
            'related_request',
            'related_idea_complaint',
        )

    @classmethod
    def get_for_user(cls, user):
        """Returns unread notifications first, then read, ordered by creation date."""
        return (
            cls._base_queryset(user)
            .order_by('is_read', '-created_at')
        )

    @classmethod
    def get_unread_count(cls, user):
        return cls._base_queryset(user).filter(is_read=False).count()

    @classmethod
    def get_by_id_for_user(cls, user, notification_id):
        try:
            return cls._base_queryset(user).get(pk=notification_id)
        except Notification.DoesNotExist as exc:
            raise NotificationServiceError(
                'اعلان مورد نظر یافت نشد.',
                {'id': ['شناسه اعلان نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def build_payload(cls, notification):
        return {
            'id': notification.id,
            'message': notification.message,
            'is_read': notification.is_read,
            'created_at': notification.created_at,
            'related_request_id': notification.related_request_id,
            'related_idea_complaint_id': notification.related_idea_complaint_id,
        }
