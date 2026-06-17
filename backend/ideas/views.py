from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response
from ideas.exceptions import IdeaServiceError
from ideas.permissions import IsStudent
from ideas.selectors.idea_selectors import IdeaSelector
from ideas.serializers import IdeaCreateSerializer, IdeaDetailSerializer, VoteActionSerializer
from ideas.services.idea_service import IdeaService


class IdeaPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


IdeaListResponseSerializer = inline_serializer(
    name='IdeaListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class IdeaListCreateView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = IdeaPagination

    @extend_schema(
        tags=['Ideas'],
        summary='لیست ایده‌های تأییدشده',
        parameters=[
            OpenApiParameter(
                name='ordering',
                description='مرتب‌سازی: newest، oldest، most_votes',
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name='search',
                description='جستجو در عنوان',
                required=False,
                type=str,
            ),
        ],
        responses={200: OpenApiResponse(IdeaListResponseSerializer)},
    )
    def get(self, request):
        ordering = request.query_params.get('ordering', 'newest')
        search = request.query_params.get('search')
        queryset = IdeaSelector.get_public_ideas(
            request.user,
            ordering=ordering,
            search=search,
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        items = page if page is not None else queryset

        results = [
            IdeaDetailSerializer(
                IdeaSelector.build_idea_payload(item, request.user),
            ).data
            for item in items
        ]

        if page is not None:
            return success_response(
                'لیست ایده‌ها با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست ایده‌ها با موفقیت دریافت شد.',
            {'results': results},
        )

    @extend_schema(
        tags=['Ideas'],
        summary='ثبت ایده جدید',
        request=IdeaCreateSerializer,
        responses={
            201: OpenApiResponse(IdeaDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
        },
    )
    def post(self, request):
        serializer = IdeaCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            idea = IdeaService.submit_idea(
                user=request.user,
                data=serializer.validated_data,
            )
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        idea = IdeaSelector.get_idea_for_user(request.user, idea.pk)
        data = IdeaDetailSerializer(
            IdeaSelector.build_idea_payload(idea, request.user),
        ).data
        return success_response(
            'ایده شما با موفقیت ثبت شد.',
            data,
            status.HTTP_201_CREATED,
        )


class MyIdeasView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = IdeaPagination

    @extend_schema(
        tags=['Ideas'],
        summary='لیست ایده‌های ثبت‌شده توسط دانشجو',
        responses={200: OpenApiResponse(IdeaListResponseSerializer)},
    )
    def get(self, request):
        queryset = IdeaSelector.get_my_ideas(request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        items = page if page is not None else queryset

        results = [
            IdeaDetailSerializer(
                IdeaSelector.build_idea_payload(item, request.user),
            ).data
            for item in items
        ]

        if page is not None:
            return success_response(
                'لیست ایده‌های شما با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست ایده‌های شما با موفقیت دریافت شد.',
            {'results': results},
        )


class IdeaDetailView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    @extend_schema(
        tags=['Ideas'],
        summary='جزئیات ایده',
        responses={
            200: OpenApiResponse(IdeaDetailSerializer),
            403: OpenApiResponse(description='عدم دسترسی'),
            404: OpenApiResponse(description='ایده یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            idea = IdeaSelector.get_idea_for_user(request.user, pk)
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = IdeaDetailSerializer(
            IdeaSelector.build_idea_payload(idea, request.user),
        ).data
        return success_response('جزئیات ایده با موفقیت دریافت شد.', data)


class IdeaVoteView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    @extend_schema(
        tags=['Ideas'],
        summary='ثبت یا تغییر رأی برای ایده',
        request=VoteActionSerializer,
        responses={
            200: OpenApiResponse(IdeaDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
        },
    )
    def post(self, request, pk):
        serializer = VoteActionSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            idea, action = IdeaService.cast_vote(
                user=request.user,
                idea_id=pk,
                vote_type=serializer.validated_data['vote_type'],
            )
        except IdeaServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        message_map = {
            'created': 'رأی شما با موفقیت ثبت شد.',
            'replaced': 'رأی شما با موفقیت به‌روزرسانی شد.',
            'removed': 'رأی شما با موفقیت حذف شد.',
        }
        data = IdeaDetailSerializer(
            IdeaSelector.build_idea_payload(idea, request.user),
        ).data
        return success_response(message_map[action], data)
