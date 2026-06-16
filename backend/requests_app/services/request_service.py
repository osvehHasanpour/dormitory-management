from django.db import transaction
from django.utils import timezone
from rest_framework import status

from core.api.permissions import is_student, is_supervisor_or_admin
from requests_app.exceptions import RequestServiceError
from requests_app.models import (
    BoothRequest,
    CleaningRequest,
    InventoryItem,
    ItemRequest,
    MaintenanceRequest,
    RequestBase,
)
from requests_app.selectors.request_selectors import RequestSelector
from requests_app.services.state_machine import validate_transition


class RequestService:
    @staticmethod
    def _ensure_student(user):
        if not is_student(user):
            raise RequestServiceError(
                'فقط دانشجویان می‌توانند درخواست ثبت کنند.',
                {'permission': ['ثبت درخواست فقط برای دانشجویان مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @staticmethod
    def _ensure_supervisor_or_admin(user):
        if not is_supervisor_or_admin(user):
            raise RequestServiceError(
                'شما مجوز انجام این عملیات را ندارید.',
                {'permission': ['این عملیات فقط برای سرپرست یا مدیر مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @classmethod
    @transaction.atomic
    def create_maintenance(cls, *, user, data):
        cls._ensure_student(user)
        return MaintenanceRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.MAINTENANCE,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            location=data['location'],
            extra_description=data.get('extra_description', ''),
            photo_url=data.get('photo_url'),
        )

    @classmethod
    @transaction.atomic
    def create_cleaning(cls, *, user, data):
        cls._ensure_student(user)
        return CleaningRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.CLEANING,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            location=data['location'],
            preferred_date=data['preferred_date'],
            extra_description=data.get('extra_description', ''),
        )

    @classmethod
    @transaction.atomic
    def create_item(cls, *, user, data):
        cls._ensure_student(user)
        item = InventoryItem.objects.select_for_update().get(pk=data['item'].pk)
        quantity = data['quantity']

        if quantity > item.quantity:
            raise RequestServiceError(
                'تعداد درخواستی بیش از موجودی انبار است.',
                {
                    'quantity': [
                        f'حداکثر موجودی «{item.item_name}» برابر {item.quantity} عدد است.',
                    ],
                },
            )

        return ItemRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.ITEM,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            item=item,
            quantity=quantity,
            delivery_status=data.get('delivery_status', ''),
        )

    @classmethod
    @transaction.atomic
    def create_booth(cls, *, user, data):
        cls._ensure_student(user)
        return BoothRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.BOOTH,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            name=data['name'],
            category=data['category'],
            event_date=data['event_date'],
        )

    @classmethod
    @transaction.atomic
    def change_status(cls, *, actor, request_id, new_status):
        cls._ensure_supervisor_or_admin(actor)

        request_obj = RequestSelector.get_request_for_update(request_id)
        validate_transition(request_obj.status, new_status)

        request_obj.status = new_status
        request_obj.handled_by = actor

        if (
            request_obj.request_type == RequestBase.RequestType.BOOTH
            and new_status == RequestBase.Status.APPROVED
        ):
            booth = request_obj.boothrequest
            if booth.approval_date is None:
                booth.approval_date = timezone.localdate()
                booth.save(update_fields=['approval_date'])

        if (
            request_obj.request_type == RequestBase.RequestType.ITEM
            and new_status == RequestBase.Status.APPROVED
            and not request_obj.itemrequest.delivery_status
        ):
            item_request = request_obj.itemrequest
            item_request.delivery_status = 'در انتظار تحویل'
            item_request.save(update_fields=['delivery_status'])

        request_obj.save(update_fields=['status', 'handled_by', 'updated_at'])
        return RequestSelector.get_request_detail(request_id)
