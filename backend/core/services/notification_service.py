from django.db import transaction

from core.models import Notification
from core.selectors.notification_selectors import NotificationSelector


class NotificationService:
    @classmethod
    @transaction.atomic
    def mark_read(cls, *, user, notification_id):
        notification = NotificationSelector.get_by_id_for_user(user, notification_id)

        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=['is_read'])

        return notification

    @classmethod
    @transaction.atomic
    def mark_all_read(cls, *, user):
        updated_count = Notification.objects.filter(
            user=user,
            is_read=False,
        ).update(is_read=True)
        return updated_count
