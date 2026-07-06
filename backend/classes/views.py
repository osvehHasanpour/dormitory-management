from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from classes.exceptions import ClassServiceError
from classes.selectors.class_selectors import ClassSelector
from classes.serializers import ClassDetailSerializer, RatingCreateSerializer
from classes.services.class_service import ClassService
from core.api.permissions import IsStudent
from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response


class ClassPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


ClassListResponseSerializer = inline_serializer(
    name='ClassListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class ClassListView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = ClassPagination

    @extend_schema(
        tags=['Classes'],
        summary='لیست کلاس‌های فعال',
        responses={
            200: OpenApiResponse(ClassListResponseSerializer, description='لیست کلاس‌های فعال'),
        },
    )
    def get(self, request):
        queryset = ClassSelector.get_active_classes(request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        results = [
            ClassDetailSerializer(ClassSelector.build_class_payload(item, request.user)).data
            for item in page
        ]

        if page is not None:
            return success_response(
                'لیست کلاس‌های فعال با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست کلاس‌های فعال با موفقیت دریافت شد.',
            {'results': results},
        )


class ClassDetailView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    @extend_schema(
        tags=['Classes'],
        summary='جزئیات کلاس',
        responses={
            200: OpenApiResponse(ClassDetailSerializer, description='جزئیات کلاس'),
            404: OpenApiResponse(description='کلاس یافت نشد'),
        },
    )
    def get(self, request, pk):
        try:
            class_obj = ClassSelector.get_class_detail(request.user, pk)
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = ClassDetailSerializer(
            ClassSelector.build_class_payload(class_obj, request.user),
        ).data
        return success_response('جزئیات کلاس با موفقیت دریافت شد.', data)


class ClassRegisterView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    @extend_schema(
        tags=['Classes'],
        summary='ثبت‌نام در کلاس',
        responses={
            201: OpenApiResponse(description='ثبت‌نام موفق'),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
        },
    )
    def post(self, request, pk):
        try:
            registration = ClassService.register(user=request.user, class_id=pk)
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = ClassSelector.build_registration_payload(registration, request.user)
        return success_response(
            'ثبت‌نام در کلاس با موفقیت انجام شد.',
            ClassDetailSerializer(data).data,
            status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=['Classes'],
        summary='لغو ثبت‌نام در کلاس',
        responses={
            200: OpenApiResponse(description='لغو ثبت‌نام موفق'),
            404: OpenApiResponse(description='ثبت‌نام فعال یافت نشد'),
        },
    )
    def delete(self, request, pk):
        try:
            ClassService.cancel_registration(user=request.user, class_id=pk)
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        return success_response('ثبت‌نام با موفقیت لغو شد.')


class MyClassesView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = ClassPagination

    @extend_schema(
        tags=['Classes'],
        summary='کلاس‌های ثبت‌نام‌شده فعال',
        responses={200: OpenApiResponse(ClassListResponseSerializer)},
    )
    def get(self, request):
        registrations = ClassSelector.get_my_active_registrations(request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(registrations, request)

        results = [
            ClassDetailSerializer(
                ClassSelector.build_registration_payload(item, request.user),
            ).data
            for item in page
        ]

        if page is not None:
            return success_response(
                'لیست کلاس‌های ثبت‌نام‌شده با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست کلاس‌های ثبت‌نام‌شده با موفقیت دریافت شد.',
            {'results': results},
        )


class MyEndedClassesView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = ClassPagination

    @extend_schema(
        tags=['Classes'],
        summary='کلاس‌های پایان‌یافته (برای امتیازدهی)',
        responses={200: OpenApiResponse(ClassListResponseSerializer)},
    )
    def get(self, request):
        registrations = ClassSelector.get_my_ended_registrations(request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(registrations, request)

        results = [
            ClassDetailSerializer(
                ClassSelector.build_registration_payload(item, request.user),
            ).data
            for item in page
        ]

        if page is not None:
            return success_response(
                'لیست کلاس‌های پایان‌یافته با موفقیت دریافت شد.',
                {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
            )

        return success_response(
            'لیست کلاس‌های پایان‌یافته با موفقیت دریافت شد.',
            {'results': results},
        )


class ClassRateView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    @extend_schema(
        tags=['Classes'],
        summary='ثبت امتیاز کلاس',
        request=RatingCreateSerializer,
        responses={
            201: OpenApiResponse(description='امتیاز با موفقیت ثبت شد'),
            400: OpenApiResponse(description='خطای اعتبارسنجی'),
        },
    )
    def post(self, request, pk):
        serializer = RatingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            class_obj, rating = ClassService.submit_rating(
                user=request.user,
                class_id=pk,
                score=serializer.validated_data['score'],
                comment=serializer.validated_data.get('comment', ''),
            )
        except ClassServiceError as exc:
            return error_response(exc.message, exc.errors, exc.status_code)

        data = ClassDetailSerializer(
            ClassSelector.build_class_payload(class_obj, request.user),
        ).data
        data['submitted_rating'] = rating.score
        return success_response(
            'امتیاز شما با موفقیت ثبت شد.',
            data,
            status.HTTP_201_CREATED,
        )
