from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response
from ideas.exceptions import IdeaServiceError
from ideas.permissions import CanSuperviseFeedback
from ideas.selectors.supervisor_feedback_selectors import SupervisorFeedbackSelector
from ideas.serializers import (
    FeedbackRejectSerializer,
    FeedbackResponseSerializer,
    IdeaReviewSerializer,
    SupervisorFeedbackDetailSerializer,
)
from ideas.services.supervisor_feedback_service import SupervisorFeedbackService


class SupervisorFeedbackPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


SupervisorFeedbackListResponseSerializer = inline_serializer(
    name='SupervisorFeedbackListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class SupervisorFeedbackListView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanSuperviseFeedback]
    pagination_class = SupervisorFeedbackPagination

    @extend_schema(
        tags=['Supervisor Feedback'],
        summary='لیست ایده‌ها، شکایات و پیشنهادات (سرپرست)',
        parameters=[
            OpenApiParameter(name='type', description='idea، complaint، suggestion', required=False, type=str),
            OpenApiParameter(name='status', description='pending، reviewed، answered، rejected', required=False, type=str),
            OpenApiParameter(name='category', description='دسته‌بندی', required=False, type=str),
            OpenApiParameter(name='date_from', description='از تاریخ (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='date_to', description='تا تاریخ (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='search', description='جستجو در عنوان و توضیحات', required=False, type=str),
            OpenApiParameter(name='ordering', description='newest یا oldest', required=False, type=str),
        ],
        responses={200: OpenApiResponse(SupervisorFeedbackListResponseSerializer)},
    )
    def get(self, request):
        queryset = SupervisorFeedbackSelector.get_supervisor_feed(
            feedback_type=request.query_params.get('type'),
            status=request.query_params.get('status'),
            category=request.query_params.get('category'),
            date_from=request.query_params.get('date_from'),
            date_to=request.query_params.get('date_to'),
            search=request.query_params.get('search'),
            ordering=request.query_params.get('ordering', 'newest'),
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        items = page if page is not None else queryset

        results = [
            SupervisorFeedbackDetailSerializer(
                SupervisorFeedbackSelector.build_supervisor_payload(item),
            ).data
            for item in items
        ]

        if page is not None:
            return success_response(
                'لیست ایده‌ها و شکایات با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست ایده‌ها و شکایات با موفقیت دریافت شد.',
            {'results': results},
        )


class SupervisorFeedbackDetailView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanSuperviseFeedback]

    @extend_schema(
        tags=['Supervisor Feedback'],
        summary='جزئیات ایده / شکایت / پیشنهاد (سرپرست)',
        responses={
            200: OpenApiResponse(SupervisorFeedbackDetailSerializer),
            404: OpenApiResponse(description='یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            item = SupervisorFeedbackSelector.get_detail_for_supervisor(pk)
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorFeedbackDetailSerializer(
            SupervisorFeedbackSelector.build_supervisor_payload(item),
        ).data
        return success_response('جزئیات با موفقیت دریافت شد.', data)


class SupervisorIdeaReviewView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanSuperviseFeedback]

    @extend_schema(
        tags=['Supervisor Feedback'],
        summary='بررسی و تأیید/رد ایده (سرپرست)',
        request=IdeaReviewSerializer,
        responses={
            200: OpenApiResponse(SupervisorFeedbackDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
        },
    )
    def patch(self, request, pk):
        serializer = IdeaReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = SupervisorFeedbackService.review_idea(
                actor=request.user,
                item_id=pk,
                action=serializer.validated_data['action'],
                response_text=serializer.validated_data.get('response_text', ''),
            )
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorFeedbackDetailSerializer(
            SupervisorFeedbackSelector.build_supervisor_payload(item),
        ).data
        return success_response('ایده با موفقیت بررسی شد.', data)


class SupervisorFeedbackRespondView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanSuperviseFeedback]

    @extend_schema(
        tags=['Supervisor Feedback'],
        summary='پاسخ به شکایت یا پیشنهاد (سرپرست)',
        request=FeedbackResponseSerializer,
        responses={
            200: OpenApiResponse(SupervisorFeedbackDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
        },
    )
    def patch(self, request, pk):
        serializer = FeedbackResponseSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = SupervisorFeedbackService.respond_to_feedback(
                actor=request.user,
                item_id=pk,
                response_text=serializer.validated_data['response_text'],
            )
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorFeedbackDetailSerializer(
            SupervisorFeedbackSelector.build_supervisor_payload(item),
        ).data
        return success_response('پاسخ با موفقیت ثبت شد.', data)


class SupervisorFeedbackRejectView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanSuperviseFeedback]

    @extend_schema(
        tags=['Supervisor Feedback'],
        summary='رد شکایت یا پیشنهاد (سرپرست)',
        request=FeedbackRejectSerializer,
        responses={
            200: OpenApiResponse(SupervisorFeedbackDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
        },
    )
    def patch(self, request, pk):
        serializer = FeedbackRejectSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = SupervisorFeedbackService.reject_feedback(
                actor=request.user,
                item_id=pk,
                response_text=serializer.validated_data['response_text'],
            )
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorFeedbackDetailSerializer(
            SupervisorFeedbackSelector.build_supervisor_payload(item),
        ).data
        return success_response('مورد با موفقیت رد شد.', data)


class SupervisorFeedbackMarkReviewView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanSuperviseFeedback]

    @extend_schema(
        tags=['Supervisor Feedback'],
        summary='علامت‌گذاری شکایت/پیشنهاد به «در حال بررسی» (سرپرست)',
        responses={
            200: OpenApiResponse(SupervisorFeedbackDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
        },
    )
    def patch(self, request, pk):
        try:
            item = SupervisorFeedbackService.mark_under_review(
                actor=request.user,
                item_id=pk,
            )
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorFeedbackDetailSerializer(
            SupervisorFeedbackSelector.build_supervisor_payload(item),
        ).data
        return success_response('وضعیت به «در حال بررسی» تغییر یافت.', data)
