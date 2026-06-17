from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from core.api.permissions import IsStudent
from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response
from requests_app.exceptions import RequestServiceError
from requests_app.selectors.complaint_selectors import ComplaintSelector
from requests_app.serializers import FeedbackCreateSerializer, FeedbackDetailSerializer
from requests_app.services.complaint_service import ComplaintService


class FeedbackPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


SuggestionListResponseSerializer = inline_serializer(
    name='SuggestionListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class SuggestionCreateView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    @extend_schema(
        tags=['Suggestions'],
        summary='ثبت پیشنهاد جدید',
        request=FeedbackCreateSerializer,
        responses={
            201: OpenApiResponse(FeedbackDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
        },
    )
    def post(self, request):
        serializer = FeedbackCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = ComplaintService.create_suggestion(
                user=request.user,
                data=serializer.validated_data,
            )
        except RequestServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = FeedbackDetailSerializer(
            ComplaintSelector.build_feedback_payload(item),
        ).data
        return success_response(
            'پیشنهاد شما با موفقیت ثبت شد.',
            data,
            status.HTTP_201_CREATED,
        )


class MySuggestionsView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = FeedbackPagination

    @extend_schema(
        tags=['Suggestions'],
        summary='لیست پیشنهادهای ثبت‌شده توسط دانشجو',
        parameters=[
            OpenApiParameter(
                name='status',
                description='فیلتر وضعیت: pending، reviewed، answered، rejected',
                required=False,
                type=str,
            ),
        ],
        responses={200: OpenApiResponse(SuggestionListResponseSerializer)},
    )
    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = ComplaintSelector.get_my_suggestions(
            request.user,
            status=status_filter,
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        items = page if page is not None else queryset

        results = [
            FeedbackDetailSerializer(
                ComplaintSelector.build_feedback_payload(item),
            ).data
            for item in items
        ]

        if page is not None:
            return success_response(
                'لیست پیشنهادهای شما با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست پیشنهادهای شما با موفقیت دریافت شد.',
            {'results': results},
        )


class SuggestionDetailView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    @extend_schema(
        tags=['Suggestions'],
        summary='جزئیات پیشنهاد',
        responses={
            200: OpenApiResponse(FeedbackDetailSerializer),
            403: OpenApiResponse(description='عدم دسترسی'),
            404: OpenApiResponse(description='پیشنهاد یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            item = ComplaintSelector.get_suggestion_for_user(request.user, pk)
        except RequestServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = FeedbackDetailSerializer(
            ComplaintSelector.build_feedback_payload(item),
        ).data
        return success_response('جزئیات پیشنهاد با موفقیت دریافت شد.', data)
