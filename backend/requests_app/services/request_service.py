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
    RequestStatusHistory,
)
from requests_app.selectors.request_selectors import (
    MAX_ACTIVE_CLEANING_REQUESTS,
    MAX_ACTIVE_ITEM_REQUESTS,
    MAX_ACTIVE_REQUESTS_COMBINED,
    MAX_ITEM_QUANTITY,
    MIN_ITEM_QUANTITY,
    RequestSelector,
)
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

    @staticmethod
    def _validate_rejection(new_status, rejection_reason):
        if new_status == RequestBase.Status.REJECTED and not rejection_reason.strip():
            raise RequestServiceError(
                'در صورت رد درخواست، ذکر دلیل الزامی است.',
                {'rejection_reason': ['در صورت رد درخواست، ذکر دلیل الزامی است.']},
            )

    @staticmethod
    def _validate_item_quantity(quantity):
        if quantity < MIN_ITEM_QUANTITY or quantity > MAX_ITEM_QUANTITY:
            raise RequestServiceError(
                f'تعداد باید بین {MIN_ITEM_QUANTITY} تا {MAX_ITEM_QUANTITY} باشد.',
                {
                    'quantity': [
                        f'تعداد درخواستی باید بین {MIN_ITEM_QUANTITY} تا {MAX_ITEM_QUANTITY} عدد باشد.',
                    ],
                },
            )

    @classmethod
    def _ensure_active_limit(cls, user, request_type, *, event_date=None):
        combined_count = RequestSelector.count_active_requests(user)
        if combined_count >= MAX_ACTIVE_REQUESTS_COMBINED:
            raise RequestServiceError(
                f'حداکثر {MAX_ACTIVE_REQUESTS_COMBINED} درخواست فعال می‌توانید داشته باشید.',
                {
                    'limit': [
                        'لطفاً پس از تکمیل یا رد درخواست‌های قبلی، '
                        'درخواست جدید ثبت کنید.',
                    ],
                },
            )

        if request_type == RequestBase.RequestType.CLEANING:
            cleaning_count = RequestSelector.count_active_requests(
                user,
                request_type=RequestBase.RequestType.CLEANING,
            )
            if cleaning_count >= MAX_ACTIVE_CLEANING_REQUESTS:
                raise RequestServiceError(
                    f'حداکثر {MAX_ACTIVE_CLEANING_REQUESTS} درخواست فعال نظافت می‌توانید داشته باشید.',
                    {
                        'limit': [
                            'لطفاً پس از تکمیل یا رد درخواست‌های قبلی، '
                            'درخواست جدید ثبت کنید.',
                        ],
                    },
                )

        if request_type == RequestBase.RequestType.ITEM:
            item_count = RequestSelector.count_active_requests(
                user,
                request_type=RequestBase.RequestType.ITEM,
            )
            if item_count >= MAX_ACTIVE_ITEM_REQUESTS:
                raise RequestServiceError(
                    f'حداکثر {MAX_ACTIVE_ITEM_REQUESTS} درخواست فعال لوازم می‌توانید داشته باشید.',
                    {
                        'limit': [
                            'لطفاً پس از تکمیل یا رد درخواست‌های قبلی، '
                            'درخواست جدید ثبت کنید.',
                        ],
                    },
                )

        if request_type == RequestBase.RequestType.BOOTH and event_date is not None:
            booth_count = RequestSelector.count_active_booth_for_event(user, event_date)
            if booth_count >= 1:
                raise RequestServiceError(
                    'برای هر بازار فقط یک درخواست غرفه فعال می‌توانید ثبت کنید.',
                    {
                        'limit': [
                            'درخواست فعال دیگری برای این تاریخ رویداد دارید.',
                        ],
                    },
                )

    @classmethod
    def _record_status_history(
        cls,
        request_obj,
        *,
        previous_status,
        new_status,
        actor=None,
        comment='',
        rejection_reason='',
    ):
        RequestStatusHistory.objects.create(
            request=request_obj,
            previous_status=previous_status,
            new_status=new_status,
            acting_supervisor=actor,
            comment=comment,
            rejection_reason=rejection_reason,
        )

    @classmethod
    def _apply_type_specific_side_effects(cls, request_obj, new_status):
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

    @classmethod
    @transaction.atomic
    def create_maintenance(cls, *, user, data):
        cls._ensure_student(user)
        cls._ensure_active_limit(user, RequestBase.RequestType.MAINTENANCE)

        request_obj = MaintenanceRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.MAINTENANCE,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            location=data['location'],
            extra_description=data.get('extra_description', ''),
            photo_url=data.get('photo_url'),
        )
        cls._record_status_history(
            request_obj,
            previous_status=None,
            new_status=RequestBase.Status.PENDING,
        )
        return request_obj

    @classmethod
    @transaction.atomic
    def create_cleaning(cls, *, user, data):
        cls._ensure_student(user)
        cls._ensure_active_limit(user, RequestBase.RequestType.CLEANING)

        request_obj = CleaningRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.CLEANING,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            location=data['location'],
            preferred_date=data['preferred_date'],
            extra_description=data.get('extra_description', ''),
        )
        cls._record_status_history(
            request_obj,
            previous_status=None,
            new_status=RequestBase.Status.PENDING,
        )
        return request_obj

    @classmethod
    @transaction.atomic
    def create_item(cls, *, user, data):
        cls._ensure_student(user)
        cls._ensure_active_limit(user, RequestBase.RequestType.ITEM)

        quantity = data['quantity']
        cls._validate_item_quantity(quantity)

        item = InventoryItem.objects.select_for_update().get(pk=data['item'].pk)

        if quantity > item.quantity:
            raise RequestServiceError(
                'تعداد درخواستی بیش از موجودی انبار است.',
                {
                    'quantity': [
                        f'حداکثر موجودی «{item.item_name}» برابر {item.quantity} عدد است.',
                    ],
                },
            )

        request_obj = ItemRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.ITEM,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            item=item,
            quantity=quantity,
            delivery_status=data.get('delivery_status', ''),
        )
        cls._record_status_history(
            request_obj,
            previous_status=None,
            new_status=RequestBase.Status.PENDING,
        )
        return request_obj

    @classmethod
    @transaction.atomic
    def create_booth(cls, *, user, data):
        cls._ensure_student(user)
        cls._ensure_active_limit(
            user,
            RequestBase.RequestType.BOOTH,
            event_date=data['event_date'],
        )

        request_obj = BoothRequest.objects.create(
            user=user,
            request_type=RequestBase.RequestType.BOOTH,
            status=RequestBase.Status.PENDING,
            description=data['description'],
            name=data['name'],
            category=data['category'],
            event_date=data['event_date'],
        )
        cls._record_status_history(
            request_obj,
            previous_status=None,
            new_status=RequestBase.Status.PENDING,
        )
        return request_obj

    @classmethod
    @transaction.atomic
    def change_status(
        cls,
        *,
        actor,
        request_id,
        new_status,
        comment='',
        rejection_reason='',
        assigned_staff_id=None,
    ):
        cls._ensure_supervisor_or_admin(actor)

        request_obj = RequestSelector.get_request_for_update(request_id)
        previous_status = request_obj.status

        cls._validate_rejection(new_status, rejection_reason)
        validate_transition(
            request_obj.status,
            new_status,
            request_type=request_obj.request_type,
        )

        if assigned_staff_id is not None:
            assigned_staff = RequestSelector.get_assignable_staff(assigned_staff_id)
            request_obj.assigned_staff = assigned_staff

        request_obj.status = new_status
        request_obj.handled_by = actor

        if new_status == RequestBase.Status.REJECTED:
            request_obj.rejection_reason = rejection_reason.strip()
        else:
            request_obj.rejection_reason = ''

        cls._apply_type_specific_side_effects(request_obj, new_status)

        update_fields = ['status', 'handled_by', 'rejection_reason', 'updated_at']
        if assigned_staff_id is not None:
            update_fields.append('assigned_staff')

        request_obj.save(update_fields=update_fields)

        cls._record_status_history(
            request_obj,
            previous_status=previous_status,
            new_status=new_status,
            actor=actor,
            comment=comment,
            rejection_reason=rejection_reason.strip() if new_status == RequestBase.Status.REJECTED else '',
        )

        return RequestSelector.get_request_detail(request_id)
