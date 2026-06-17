from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from announcements.exceptions import AnnouncementServiceError
from announcements.selectors.announcement_selectors import AnnouncementSelector
from announcements.serializers import (
    AnnouncementCreateSerializer,
    AnnouncementDetailSerializer,
    AnnouncementUpdateSerializer,
)
from announcements.services.announcement_service import AnnouncementService
from core.api.permissions import IsSupervisorOrAdmin, is_supervisor_or_admin
from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response


class AnnouncementPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


AnnouncementListResponseSerializer = inline_serializer(
    name='AnnouncementListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class AnnouncementListView(EnvelopedAPIViewMixin, APIView):
    """
    GET  — all authenticated users: lists active announcements.
    POST — supervisor/admin only: creates a new announcement (auto-notifies all students).
    """

    pagination_class = AnnouncementPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSupervisorOrAdmin()]
        return [permissions.IsAuthenticated()]

    @extend_schema(
        tags=['Announcements'],
        summary='لیست اطلاعیه‌های فعال',
        parameters=[
            OpenApiParameter(
                name='page',
                description='شماره صفحه',
                required=False,
                type=int,
            ),
        ],
        responses={200: OpenApiResponse(AnnouncementListResponseSerializer)},
    )
    def get(self, request):
        queryset = AnnouncementSelector.get_active_list()

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        items = page if page is not None else queryset

        results = [
            AnnouncementDetailSerializer(AnnouncementSelector.build_payload(item)).data
            for item in items
        ]

        if page is not None:
            return success_response(
                'لیست اطلاعیه‌ها با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست اطلاعیه‌ها با موفقیت دریافت شد.',
            {'results': results},
        )

    @extend_schema(
        tags=['Announcements'],
        summary='ایجاد اطلاعیه جدید (سرپرست/مدیر)',
        request=AnnouncementCreateSerializer,
        responses={
            201: OpenApiResponse(AnnouncementDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
        },
    )
    def post(self, request):
        serializer = AnnouncementCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            announcement = AnnouncementService.create(
                user=request.user,
                data=serializer.validated_data,
            )
        except AnnouncementServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = AnnouncementDetailSerializer(
            AnnouncementSelector.build_payload(announcement),
        ).data
        return success_response(
            'اطلاعیه با موفقیت ایجاد شد و به همه دانشجویان اطلاع‌رسانی شد.',
            data,
            status.HTTP_201_CREATED,
        )


class AnnouncementDetailView(EnvelopedAPIViewMixin, APIView):
    """
    GET    — all authenticated users: retrieves a single active announcement.
    PUT    — supervisor/admin only: updates the announcement.
    DELETE — supervisor/admin only: deactivates (soft-delete) the announcement.
    """

    def get_permissions(self):
        if self.request.method in ('PUT', 'DELETE'):
            return [permissions.IsAuthenticated(), IsSupervisorOrAdmin()]
        return [permissions.IsAuthenticated()]

    @extend_schema(
        tags=['Announcements'],
        summary='جزئیات اطلاعیه',
        responses={
            200: OpenApiResponse(AnnouncementDetailSerializer),
            404: OpenApiResponse(description='اطلاعیه یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            announcement = AnnouncementSelector.get_by_id(pk)
        except AnnouncementServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        if not announcement.is_active:
            if not is_supervisor_or_admin(request.user):
                return error_response(
                    'اطلاعیه مورد نظر یافت نشد.',
                    {'id': ['شناسه اطلاعیه نامعتبر است.']},
                    status.HTTP_404_NOT_FOUND,
                )

        data = AnnouncementDetailSerializer(
            AnnouncementSelector.build_payload(announcement),
        ).data
        return success_response('جزئیات اطلاعیه با موفقیت دریافت شد.', data)

    @extend_schema(
        tags=['Announcements'],
        summary='ویرایش اطلاعیه (سرپرست/مدیر)',
        request=AnnouncementUpdateSerializer,
        responses={
            200: OpenApiResponse(AnnouncementDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
            404: OpenApiResponse(description='اطلاعیه یافت نشد'),
        },
    )
    def put(self, request, pk):
        serializer = AnnouncementUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            announcement = AnnouncementService.update(
                user=request.user,
                announcement_id=pk,
                data=serializer.validated_data,
            )
        except AnnouncementServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = AnnouncementDetailSerializer(
            AnnouncementSelector.build_payload(announcement),
        ).data
        return success_response('اطلاعیه با موفقیت به‌روزرسانی شد.', data)

    @extend_schema(
        tags=['Announcements'],
        summary='غیرفعال‌سازی اطلاعیه (سرپرست/مدیر)',
        responses={
            200: OpenApiResponse(AnnouncementDetailSerializer),
            400: OpenApiResponse(description='اطلاعیه قبلاً غیرفعال شده'),
            403: OpenApiResponse(description='عدم دسترسی'),
            404: OpenApiResponse(description='اطلاعیه یافت نشد'),
        },
    )
    def delete(self, request, pk):
        try:
            announcement = AnnouncementService.deactivate(
                user=request.user,
                announcement_id=pk,
            )
        except AnnouncementServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = AnnouncementDetailSerializer(
            AnnouncementSelector.build_payload(announcement),
        ).data
        return success_response('اطلاعیه با موفقیت غیرفعال شد.', data)
