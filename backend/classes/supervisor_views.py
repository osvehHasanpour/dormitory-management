from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from classes.exceptions import ClassServiceError
from classes.permissions import CanManageClasses
from classes.selectors.supervisor_class_selectors import SupervisorClassSelector
from classes.serializers import (
    SupervisorClassCreateSerializer,
    SupervisorClassDetailSerializer,
    SupervisorClassUpdateSerializer,
    SupervisorEnrollmentSerializer,
    SupervisorRatingOverviewSerializer,
)
from classes.services.supervisor_class_service import SupervisorClassService
from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response


class SupervisorClassPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


SupervisorClassListResponseSerializer = inline_serializer(
    name='SupervisorClassListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class SupervisorClassListView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanManageClasses]
    pagination_class = SupervisorClassPagination

    @extend_schema(
        tags=['Supervisor Classes'],
        summary='لیست کلاس‌ها (سرپرست)',
        parameters=[
            OpenApiParameter(name='status', description='active، completed، cancelled، finished (همه به‌جز active)', required=False, type=str),
            OpenApiParameter(name='category', description='دسته‌بندی', required=False, type=str),
            OpenApiParameter(name='search', description='جستجو در عنوان و توضیحات', required=False, type=str),
            OpenApiParameter(name='ordering', description='newest یا oldest', required=False, type=str),
        ],
        responses={200: OpenApiResponse(SupervisorClassListResponseSerializer)},
    )
    def get(self, request):
        queryset = SupervisorClassSelector.get_supervisor_list(
            status_filter=request.query_params.get('status'),
            category=request.query_params.get('category'),
            search=request.query_params.get('search'),
            ordering=request.query_params.get('ordering', 'newest'),
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        items = page if page is not None else queryset

        results = [
            SupervisorClassDetailSerializer(
                SupervisorClassSelector.build_supervisor_payload(item),
            ).data
            for item in items
        ]

        if page is not None:
            return success_response(
                'لیست کلاس‌ها با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست کلاس‌ها با موفقیت دریافت شد.',
            {'results': results},
        )

    @extend_schema(
        tags=['Supervisor Classes'],
        summary='ایجاد کلاس جدید (سرپرست)',
        request=SupervisorClassCreateSerializer,
        responses={
            201: OpenApiResponse(SupervisorClassDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
        },
    )
    def post(self, request):
        serializer = SupervisorClassCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            class_obj = SupervisorClassService.create(
                user=request.user,
                data=serializer.validated_data,
            )
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorClassDetailSerializer(
            SupervisorClassSelector.build_supervisor_payload(class_obj),
        ).data
        return success_response(
            'کلاس با موفقیت ثبت شد.',
            data,
            status.HTTP_201_CREATED,
        )


class SupervisorClassDetailView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanManageClasses]

    @extend_schema(
        tags=['Supervisor Classes'],
        summary='جزئیات کلاس (سرپرست)',
        responses={
            200: OpenApiResponse(SupervisorClassDetailSerializer),
            404: OpenApiResponse(description='کلاس یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            class_obj = SupervisorClassSelector.get_by_id(pk)
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorClassDetailSerializer(
            SupervisorClassSelector.build_supervisor_payload(class_obj),
        ).data
        return success_response('جزئیات کلاس با موفقیت دریافت شد.', data)

    @extend_schema(
        tags=['Supervisor Classes'],
        summary='ویرایش کلاس (سرپرست)',
        request=SupervisorClassUpdateSerializer,
        responses={
            200: OpenApiResponse(SupervisorClassDetailSerializer),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
            403: OpenApiResponse(description='عدم دسترسی'),
            404: OpenApiResponse(description='کلاس یافت نشد'),
        },
    )
    def put(self, request, pk):
        serializer = SupervisorClassUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        if not serializer.validated_data:
            return error_response(
                'حداقل یک فیلد برای به‌روزرسانی الزامی است.',
                {'detail': ['بدنه درخواست خالی است.']},
            )

        try:
            class_obj = SupervisorClassService.update(
                user=request.user,
                class_id=pk,
                data=serializer.validated_data,
            )
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorClassDetailSerializer(
            SupervisorClassSelector.build_supervisor_payload(class_obj),
        ).data
        return success_response('کلاس با موفقیت به‌روزرسانی شد.', data)

    @extend_schema(
        tags=['Supervisor Classes'],
        summary='لغو کلاس (سرپرست)',
        responses={
            200: OpenApiResponse(SupervisorClassDetailSerializer),
            400: OpenApiResponse(description='کلاس قبلاً لغو شده'),
            403: OpenApiResponse(description='عدم دسترسی'),
            404: OpenApiResponse(description='کلاس یافت نشد'),
        },
    )
    def delete(self, request, pk):
        try:
            class_obj = SupervisorClassService.cancel(
                user=request.user,
                class_id=pk,
            )
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = SupervisorClassDetailSerializer(
            SupervisorClassSelector.build_supervisor_payload(class_obj),
        ).data
        return success_response('کلاس با موفقیت لغو شد.', data)


class SupervisorClassEnrollmentsView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanManageClasses]
    pagination_class = SupervisorClassPagination

    @extend_schema(
        tags=['Supervisor Classes'],
        summary='لیست دانشجویان ثبت‌نام‌شده (سرپرست)',
        responses={
            200: OpenApiResponse(SupervisorClassListResponseSerializer),
            404: OpenApiResponse(description='کلاس یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            enrollments = SupervisorClassSelector.get_enrollments(pk)
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(enrollments, request)
        items = page if page is not None else enrollments

        results = [
            SupervisorEnrollmentSerializer(
                SupervisorClassSelector.build_enrollment_payload(item),
            ).data
            for item in items
        ]

        enrolled_count = enrollments.count()
        payload = {
            'enrolled_count': enrolled_count,
            'results': results,
        }

        if page is not None:
            payload.update({
                'count': paginator.page.paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
            })

        return success_response(
            'لیست ثبت‌نام‌شده‌ها با موفقیت دریافت شد.',
            payload,
        )


class SupervisorClassRatingsView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, CanManageClasses]
    pagination_class = SupervisorClassPagination

    @extend_schema(
        tags=['Supervisor Classes'],
        summary='لیست امتیازها و نظرات (سرپرست)',
        responses={
            200: OpenApiResponse(SupervisorClassListResponseSerializer),
            404: OpenApiResponse(description='کلاس یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            class_obj, ratings = SupervisorClassSelector.get_ratings(pk)
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(ratings, request)
        items = page if page is not None else ratings

        results = [
            SupervisorRatingOverviewSerializer(
                SupervisorClassSelector.build_rating_payload(item),
            ).data
            for item in items
        ]

        average_rating = getattr(class_obj, 'average_rating', None)
        if average_rating is not None:
            average_rating = round(float(average_rating), 1)

        payload = {
            'average_rating': average_rating,
            'ratings_count': ratings.count(),
            'results': results,
        }

        if page is not None:
            payload.update({
                'count': paginator.page.paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
            })

        return success_response(
            'لیست امتیازها با موفقیت دریافت شد.',
            payload,
        )
