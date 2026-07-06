from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response
from core.exceptions import NotificationServiceError
from core.selectors.notification_selectors import NotificationSelector
from core.serializers import NotificationDetailSerializer
from core.services.notification_service import NotificationService


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


NotificationListResponseSerializer = inline_serializer(
    name='NotificationListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class NotificationListView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination

    @extend_schema(
        tags=['Notifications'],
        summary='لیست اعلان‌های کاربر (خوانده‌نشده اول)',
        responses={200: OpenApiResponse(NotificationListResponseSerializer)},
    )
    def get(self, request):
        queryset = NotificationSelector.get_for_user(request.user)
        unread_count = NotificationSelector.get_unread_count(request.user)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        items = page if page is not None else queryset

        results = [
            NotificationDetailSerializer(
                NotificationSelector.build_payload(item),
            ).data
            for item in items
        ]

        if page is not None:
            return success_response(
                'لیست اعلان‌ها با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'unread_count': unread_count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست اعلان‌ها با موفقیت دریافت شد.',
            {
                'unread_count': unread_count,
                'results': results,
            },
        )


class NotificationMarkReadView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='علامت‌گذاری اعلان به‌عنوان خوانده‌شده',
        responses={
            200: OpenApiResponse(NotificationDetailSerializer),
            404: OpenApiResponse(description='اعلان یافت نشد'),
        },
    )
    def post(self, request, pk):
        try:
            notification = NotificationService.mark_read(
                user=request.user,
                notification_id=pk,
            )
        except NotificationServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = NotificationDetailSerializer(
            NotificationSelector.build_payload(notification),
        ).data
        return success_response('اعلان با موفقیت خوانده‌شده علامت‌گذاری شد.', data)


class NotificationMarkAllReadView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='علامت‌گذاری همه اعلان‌ها به‌عنوان خوانده‌شده',
        responses={200: OpenApiResponse(description='تعداد اعلان‌های به‌روزرسانی‌شده')},
    )
    def post(self, request):
        updated_count = NotificationService.mark_all_read(user=request.user)
        return success_response(
            f'تعداد {updated_count} اعلان با موفقیت خوانده‌شده علامت‌گذاری شد.',
            {'updated_count': updated_count},
        )
