from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from users.serializers import LoginSerializer, UserProfileSerializer
from users.services.auth_service import AuthService, AuthServiceError


def _normalize_errors(errors):
    if isinstance(errors, dict):
        return {key: _normalize_errors(value) for key, value in errors.items()}

    if isinstance(errors, list):
        return [_normalize_errors(item) for item in errors]

    return str(errors)


def _success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response(
        {
            'success': True,
            'message': message,
            'data': data or {},
        },
        status=status_code,
    )


def _error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response(
        {
            'success': False,
            'message': message,
            'errors': _normalize_errors(errors or {}),
        },
        status=status_code,
    )


AuthErrorResponseSerializer = inline_serializer(
    name='AuthErrorResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'errors': serializers.DictField(),
    },
)

TokenRefreshRequestSerializer = inline_serializer(
    name='TokenRefreshRequest',
    fields={
        'refresh': serializers.CharField(),
    },
)

LogoutRequestSerializer = inline_serializer(
    name='LogoutRequest',
    fields={
        'refresh': serializers.CharField(),
    },
)

LoginResponseSerializer = inline_serializer(
    name='LoginResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': inline_serializer(
            name='LoginResponseData',
            fields={
                'access': serializers.CharField(),
                'refresh': serializers.CharField(),
                'user': UserProfileSerializer(),
            },
        ),
    },
)

TokenRefreshResponseSerializer = inline_serializer(
    name='TokenRefreshResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)

ProfileResponseSerializer = inline_serializer(
    name='ProfileResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': UserProfileSerializer(),
    },
)

LogoutResponseSerializer = inline_serializer(
    name='LogoutResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class AuthAPIView(APIView):
    def handle_exception(self, exc):
        if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            message = 'اطلاعات احراز هویت نامعتبر است.'
            return _error_response(
                message,
                {'authentication': [message]},
                status.HTTP_401_UNAUTHORIZED,
            )

        if isinstance(exc, PermissionDenied):
            message = 'شما مجوز انجام این عملیات را ندارید.'
            return _error_response(
                message,
                {'permission': [message]},
                status.HTTP_403_FORBIDDEN,
            )

        return super().handle_exception(exc)


class LoginView(AuthAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        tags=['Authentication'],
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(LoginResponseSerializer, description='ورود موفق'),
            400: OpenApiResponse(AuthErrorResponseSerializer, description='خطای اعتبارسنجی'),
            403: OpenApiResponse(AuthErrorResponseSerializer, description='حساب غیرفعال'),
        },
        examples=[
            OpenApiExample(
                'ورود موفق',
                value={
                    'success': True,
                    'message': 'ورود با موفقیت انجام شد.',
                    'data': {
                        'access': '<access-token>',
                        'refresh': '<refresh-token>',
                        'user': {
                            'id': 1,
                            'personnel_code': '401234567',
                            'first_name': 'علی',
                            'last_name': 'رضایی',
                            'role_name': 'student',
                            'is_active': True,
                        },
                    },
                },
                response_only=True,
            ),
        ],
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return _error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = AuthService.login(
                personnel_code=serializer.validated_data['personnel_code'],
                password=serializer.validated_data['password'],
                request=request,
            )
        except AuthServiceError as exc:
            return _error_response(exc.message, exc.errors, exc.status_code)

        user_data = UserProfileSerializer(result.user).data
        return _success_response(
            'ورود با موفقیت انجام شد.',
            {
                **result.tokens,
                'user': user_data,
            },
        )


class LogoutView(AuthAPIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        request=LogoutRequestSerializer,
        responses={
            200: OpenApiResponse(LogoutResponseSerializer, description='خروج موفق'),
            400: OpenApiResponse(AuthErrorResponseSerializer, description='توکن نامعتبر'),
            401: OpenApiResponse(AuthErrorResponseSerializer, description='احراز هویت نامعتبر'),
        },
    )
    def post(self, request):
        try:
            AuthService.blacklist_refresh_token(request.data.get('refresh'))
        except AuthServiceError as exc:
            return _error_response(exc.message, exc.errors, exc.status_code)

        return _success_response('خروج با موفقیت انجام شد.')


class ProfileView(AuthAPIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        responses={
            200: OpenApiResponse(ProfileResponseSerializer, description='پروفایل کاربر'),
            401: OpenApiResponse(AuthErrorResponseSerializer, description='احراز هویت نامعتبر'),
        },
    )
    def get(self, request):
        user = (
            User.objects.select_related('block', 'role')
            .prefetch_related('room_assignments__room__block')
            .get(pk=request.user.pk)
        )
        return _success_response(
            'پروفایل کاربر با موفقیت دریافت شد.',
            UserProfileSerializer(user).data,
        )


class TokenRefreshView(AuthAPIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        request=TokenRefreshRequestSerializer,
        responses={
            200: OpenApiResponse(TokenRefreshResponseSerializer, description='توکن تازه‌سازی شد'),
            400: OpenApiResponse(AuthErrorResponseSerializer, description='توکن ارسال نشده است'),
            401: OpenApiResponse(AuthErrorResponseSerializer, description='توکن نامعتبر'),
        },
    )
    def post(self, request):
        try:
            tokens = AuthService.refresh_tokens(request.data.get('refresh'))
        except AuthServiceError as exc:
            return _error_response(exc.message, exc.errors, exc.status_code)

        return _success_response('توکن با موفقیت تازه‌سازی شد.', tokens)
