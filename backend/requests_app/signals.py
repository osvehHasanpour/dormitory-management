from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from core.models import Notification
from requests_app.models import RequestBase

STATUS_LABELS = dict(RequestBase.Status.choices)


@receiver(pre_save, sender=RequestBase)
def capture_previous_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._previous_status = RequestBase.objects.get(pk=instance.pk).status
        except RequestBase.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=RequestBase)
def notify_on_status_change(sender, instance, created, **kwargs):
    previous_status = getattr(instance, '_previous_status', None)
    if created:
        if instance.status == RequestBase.Status.PENDING:
            return
        previous_status = None

    if previous_status is not None and previous_status == instance.status:
        return

    status_label = STATUS_LABELS.get(instance.status, instance.status)
    Notification.objects.create(
        user=instance.user,
        message=f'وضعیت درخواست شما به «{status_label}» تغییر یافت.',
        related_request=instance,
    )
