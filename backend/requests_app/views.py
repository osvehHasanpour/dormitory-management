from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.views import APIView

from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response
from requests_app.exceptions import RequestServiceError
from requests_app.models import (
    BoothRequest,
    CleaningRequest,
    ItemRequest,
    MaintenanceRequest,
)
from requests_app.permissions import CanAccessRequests, IsStudent
from requests_app.selectors.request_selectors import RequestSelector
from requests_app.serializers import (
    BoothRequestCreateSerializer,
    BoothRequestDetailSerializer,
    CleaningRequestCreateSerializer,
    CleaningRequestDetailSerializer,
    InventoryItemSerializer,
    ItemRequestCreateSerializer,
    ItemRequestDetailSerializer,
    MaintenanceRequestCreateSerializer,
    MaintenanceRequestDetailSerializer,
)
from requests_app.services.request_service import RequestService


class BaseRequestViewSet(
    EnvelopedAPIViewMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [CanAccessRequests]
    http_method_names = ['get', 'post', 'head', 'options']

    model_class = None
    create_serializer_class = None
    detail_serializer_class = None
    create_service_method = None
    list_message = ''
    retrieve_message = ''
    create_message = ''

    def get_queryset(self):
        return RequestSelector.get_typed_queryset_for_user(
            self.request.user,
            self.model_class,
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return self.create_serializer_class
        return self.detail_serializer_class

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        if page is not None:
            paginated = self.get_paginated_response(serializer.data).data
            return success_response(
                self.list_message,
                {
                    'count': paginated['count'],
                    'next': paginated['next'],
                    'previous': paginated['previous'],
                    'results': paginated['results'],
                },
            )
        return success_response(self.list_message, {'results': serializer.data})

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = RequestSelector.get_typed_instance_for_user(
                request.user,
                self.model_class,
                kwargs['pk'],
            )
        except RequestServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        serializer = self.get_serializer(instance)
        return success_response(self.retrieve_message, serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = self.create_service_method(
                user=request.user,
                data=serializer.validated_data,
            )
        except RequestServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        output = self.detail_serializer_class(instance).data
        return success_response(
            self.create_message,
            output,
            status.HTTP_201_CREATED,
        )


@extend_schema_view(
    list=extend_schema(tags=['Requests'], summary='لیست درخواست‌های تعمیرات'),
    retrieve=extend_schema(tags=['Requests'], summary='جزئیات درخواست تعمیرات'),
    create=extend_schema(tags=['Requests'], summary='ثبت درخواست تعمیرات'),
)
class MaintenanceRequestViewSet(BaseRequestViewSet):
    model_class = MaintenanceRequest
    create_serializer_class = MaintenanceRequestCreateSerializer
    detail_serializer_class = MaintenanceRequestDetailSerializer
    create_service_method = RequestService.create_maintenance
    list_message = 'لیست درخواست‌های تعمیرات با موفقیت دریافت شد.'
    retrieve_message = 'جزئیات درخواست تعمیرات با موفقیت دریافت شد.'
    create_message = 'درخواست تعمیرات با موفقیت ثبت شد.'

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        return [CanAccessRequests()]


@extend_schema_view(
    list=extend_schema(tags=['Requests'], summary='لیست درخواست‌های نظافت'),
    retrieve=extend_schema(tags=['Requests'], summary='جزئیات درخواست نظافت'),
    create=extend_schema(tags=['Requests'], summary='ثبت درخواست نظافت'),
)
class CleaningRequestViewSet(BaseRequestViewSet):
    model_class = CleaningRequest
    create_serializer_class = CleaningRequestCreateSerializer
    detail_serializer_class = CleaningRequestDetailSerializer
    create_service_method = RequestService.create_cleaning
    list_message = 'لیست درخواست‌های نظافت با موفقیت دریافت شد.'
    retrieve_message = 'جزئیات درخواست نظافت با موفقیت دریافت شد.'
    create_message = 'درخواست نظافت با موفقیت ثبت شد.'

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        return [CanAccessRequests()]


@extend_schema_view(
    list=extend_schema(tags=['Requests'], summary='لیست درخواست‌های لوازم'),
    retrieve=extend_schema(tags=['Requests'], summary='جزئیات درخواست لوازم'),
    create=extend_schema(tags=['Requests'], summary='ثبت درخواست لوازم'),
)
class ItemRequestViewSet(BaseRequestViewSet):
    model_class = ItemRequest
    create_serializer_class = ItemRequestCreateSerializer
    detail_serializer_class = ItemRequestDetailSerializer
    create_service_method = RequestService.create_item
    list_message = 'لیست درخواست‌های لوازم با موفقیت دریافت شد.'
    retrieve_message = 'جزئیات درخواست لوازم با موفقیت دریافت شد.'
    create_message = 'درخواست لوازم با موفقیت ثبت شد.'

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        return [CanAccessRequests()]


@extend_schema_view(
    list=extend_schema(tags=['Requests'], summary='لیست درخواست‌های غرفه'),
    retrieve=extend_schema(tags=['Requests'], summary='جزئیات درخواست غرفه'),
    create=extend_schema(tags=['Requests'], summary='ثبت درخواست غرفه'),
)
class BoothRequestViewSet(BaseRequestViewSet):
    model_class = BoothRequest
    create_serializer_class = BoothRequestCreateSerializer
    detail_serializer_class = BoothRequestDetailSerializer
    create_service_method = RequestService.create_booth
    list_message = 'لیست درخواست‌های غرفه با موفقیت دریافت شد.'
    retrieve_message = 'جزئیات درخواست غرفه با موفقیت دریافت شد.'
    create_message = 'درخواست غرفه با موفقیت ثبت شد.'

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        return [CanAccessRequests()]


class InventoryItemListView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [CanAccessRequests]

    @extend_schema(
        tags=['Requests'],
        summary='لیست کالاهای انبار',
        responses={
            200: OpenApiResponse(description='لیست کالاهای موجود'),
        },
    )
    def get(self, request):
        items = RequestSelector.list_inventory_items()
        data = InventoryItemSerializer(items, many=True).data
        return success_response('لیست کالاهای انبار با موفقیت دریافت شد.', {'results': data})
