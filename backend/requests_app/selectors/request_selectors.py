from django.core.paginator import Paginator
from django.db.models import Prefetch

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
from rest_framework import status
from users.models import Role, User


ACTIVE_REQUEST_STATUSES = (
    RequestBase.Status.PENDING,
    RequestBase.Status.IN_PROGRESS,
    RequestBase.Status.APPROVED,
)

MAX_ACTIVE_CLEANING_REQUESTS = 3
MAX_ACTIVE_ITEM_REQUESTS = 3
MAX_ACTIVE_REQUESTS_COMBINED = 10
MAX_ITEM_QUANTITY = 3
MIN_ITEM_QUANTITY = 1

STATUS_HISTORY_SELECT_RELATED = (
    'acting_supervisor',
    'acting_supervisor__role',
)

REQUEST_DETAIL_SELECT_RELATED = (
    'user',
    'user__role',
    'handled_by',
    'handled_by__role',
    'assigned_staff',
    'assigned_staff__role',
    'maintenancerequest',
    'cleaningrequest',
    'itemrequest',
    'itemrequest__item',
    'boothrequest',
)


class RequestSelector:
    @staticmethod
    def _status_history_prefetch():
        return Prefetch(
            'status_history',
            queryset=RequestStatusHistory.objects.select_related(
                *STATUS_HISTORY_SELECT_RELATED,
            ).order_by('created_at'),
        )

    @classmethod
    def _base_queryset(cls):
        return RequestBase.objects.select_related(
            *REQUEST_DETAIL_SELECT_RELATED,
        ).prefetch_related(cls._status_history_prefetch())

    @classmethod
    def get_student_queryset(cls, user, *, request_type=None):
        if not is_student(user):
            return RequestBase.objects.none()

        queryset = cls._base_queryset().filter(user=user)
        if request_type:
            queryset = queryset.filter(request_type=request_type)
        return queryset.order_by('-created_at')

    @classmethod
    def get_supervisor_queryset(cls, user, *, status=None, request_type=None):
        if not is_supervisor_or_admin(user):
            return RequestBase.objects.none()

        queryset = cls._base_queryset()
        if status:
            queryset = queryset.filter(status=status)
        if request_type:
            queryset = queryset.filter(request_type=request_type)
        return queryset.order_by('-created_at')

    @classmethod
    def get_typed_student_queryset(cls, user, model_class):
        if not is_student(user):
            return model_class.objects.none()

        return (
            model_class.objects.select_related(
                'user',
                'user__role',
                'handled_by',
                'handled_by__role',
                'assigned_staff',
                'assigned_staff__role',
            )
            .prefetch_related(cls._status_history_prefetch())
            .filter(user=user)
            .order_by('-created_at')
        )

    @classmethod
    def get_typed_supervisor_queryset(cls, user, model_class):
        if not is_supervisor_or_admin(user):
            return model_class.objects.none()

        return (
            model_class.objects.select_related(
                'user',
                'user__role',
                'handled_by',
                'handled_by__role',
                'assigned_staff',
                'assigned_staff__role',
            )
            .prefetch_related(cls._status_history_prefetch())
            .order_by('-created_at')
        )

    @classmethod
    def get_typed_queryset_for_user(cls, user, model_class):
        if is_supervisor_or_admin(user):
            queryset = cls.get_typed_supervisor_queryset(user, model_class)
        elif is_student(user):
            queryset = cls.get_typed_student_queryset(user, model_class)
        else:
            return model_class.objects.none()

        if model_class is ItemRequest:
            queryset = queryset.select_related('item')
        return queryset

    @classmethod
    def get_request_detail(cls, request_id):
        try:
            return cls._base_queryset().get(pk=request_id)
        except RequestBase.DoesNotExist as exc:
            raise RequestServiceError(
                'درخواست مورد نظر یافت نشد.',
                {'request_id': ['شناسه درخواست نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def get_request_for_user(cls, user, request_id):
        request_obj = cls.get_request_detail(request_id)
        if is_supervisor_or_admin(user):
            return request_obj
        if is_student(user) and request_obj.user_id == user.id:
            return request_obj

        raise RequestServiceError(
            'شما مجوز مشاهده این درخواست را ندارید.',
            {'permission': ['دسترسی به این درخواست مجاز نیست.']},
            status.HTTP_403_FORBIDDEN,
        )

    @classmethod
    def get_request_for_update(cls, request_id):
        try:
            return RequestBase.objects.select_for_update().get(pk=request_id)
        except RequestBase.DoesNotExist as exc:
            raise RequestServiceError(
                'درخواست مورد نظر یافت نشد.',
                {'request_id': ['شناسه درخواست نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def get_typed_instance_for_user(cls, user, model_class, pk):
        queryset = model_class.objects.select_related(
            'user',
            'user__role',
            'handled_by',
            'handled_by__role',
            'assigned_staff',
            'assigned_staff__role',
        ).prefetch_related(cls._status_history_prefetch())
        if model_class is ItemRequest:
            queryset = queryset.select_related('item')

        try:
            obj = queryset.get(pk=pk)
        except model_class.DoesNotExist as exc:
            raise RequestServiceError(
                'درخواست مورد نظر یافت نشد.',
                {'id': ['شناسه درخواست نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        if is_supervisor_or_admin(user):
            return obj
        if is_student(user) and obj.user_id == user.id:
            return obj

        raise RequestServiceError(
            'شما مجوز مشاهده این درخواست را ندارید.',
            {'permission': ['دسترسی به این درخواست مجاز نیست.']},
            status.HTTP_403_FORBIDDEN,
        )

    @classmethod
    def paginate_queryset(cls, queryset, *, page, page_size):
        paginator = Paginator(queryset, page_size)
        if page > paginator.num_pages and paginator.count > 0:
            raise RequestServiceError(
                'شماره صفحه نامعتبر است.',
                {'page': ['صفحه درخواستی وجود ندارد.']},
            )

        page_obj = paginator.get_page(page)
        return {
            'total_count': paginator.count,
            'page': page_obj.number,
            'page_size': page_size,
            'items': list(page_obj.object_list),
        }

    @classmethod
    def get_supervisor_feed(cls, user, *, status=None, request_type=None, page=1, page_size=20):
        queryset = cls.get_supervisor_queryset(
            user,
            status=status,
            request_type=request_type,
        )
        return cls.paginate_queryset(queryset, page=page, page_size=page_size)

    @classmethod
    def list_inventory_items(cls):
        return InventoryItem.objects.order_by('item_name')

    @classmethod
    def get_child_model_map(cls):
        return {
            RequestBase.RequestType.MAINTENANCE: MaintenanceRequest,
            RequestBase.RequestType.CLEANING: CleaningRequest,
            RequestBase.RequestType.ITEM: ItemRequest,
            RequestBase.RequestType.BOOTH: BoothRequest,
        }

    @classmethod
    def count_active_requests(cls, user, *, request_type=None):
        queryset = RequestBase.objects.filter(
            user=user,
            status__in=ACTIVE_REQUEST_STATUSES,
        )
        if request_type:
            queryset = queryset.filter(request_type=request_type)
        return queryset.count()

    @classmethod
    def count_active_booth_for_event(cls, user, event_date):
        return BoothRequest.objects.filter(
            user=user,
            event_date=event_date,
            status__in=ACTIVE_REQUEST_STATUSES,
        ).count()

    @classmethod
    def get_status_history(cls, request_id):
        return (
            RequestStatusHistory.objects.filter(request_id=request_id)
            .select_related(*STATUS_HISTORY_SELECT_RELATED)
            .order_by('created_at')
        )

    @classmethod
    def get_assignable_staff_queryset(cls):
        return User.objects.filter(
            role__name__in=(Role.Name.SUPERVISOR, Role.Name.ADMIN),
            is_active=True,
        )

    @classmethod
    def get_assignable_staff(cls, staff_id):
        try:
            return cls.get_assignable_staff_queryset().get(pk=staff_id)
        except User.DoesNotExist as exc:
            raise RequestServiceError(
                'کارمند انتخاب‌شده یافت نشد.',
                {'assigned_staff': ['کاربر محول‌شده معتبر نیست.']},
                status.HTTP_400_BAD_REQUEST,
            ) from exc

    @classmethod
    def resolve_typed_request(cls, request_obj):
        model_class = cls.get_child_model_map().get(request_obj.request_type)
        if model_class is None:
            return request_obj

        queryset = model_class.objects.select_related(
            *REQUEST_DETAIL_SELECT_RELATED,
        ).prefetch_related(cls._status_history_prefetch())
        if model_class is ItemRequest:
            queryset = queryset.select_related('item')
        return queryset.get(pk=request_obj.pk)
