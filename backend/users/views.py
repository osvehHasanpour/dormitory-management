import logging

from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, inline_serializer
from django.db.models import Prefetch
from rest_framework import permissions, serializers, status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from dorms.models import RoomAssignment
from users.models import User
from users.serializers import LoginSerializer, UserProfileSerializer
from users.services.auth_service import AuthService, AuthServiceError

api_logger = logging.getLogger('rest_framework')
auth_logger = logging.getLogger('auth')
security_logger = logging.getLogger('security')


def get_profile_user_queryset():
    return User.objects.select_related('role', 'block').prefetch_related(
        Prefetch(
            'room_assignments',
            queryset=RoomAssignment.objects.filter(is_current=True).select_related(
                'room',
                'room__block',
            ),
        ),
    )


def _normalize_errors(errors):
    if isinstance(errors, dict):
        return {key: _normalize_errors(value) for key, value in errors.items()}

    if isinstance(errors, list):
        return [_normalize_errors(item) for item in errors]

    return str(errors)


def _request_metadata(request):
    if not request:
        return 'UNKNOWN', 'unknown-path', 'anonymous', '-', '-'

    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    client_ip = (
        forwarded_for.split(',')[0].strip()
        if forwarded_for
        else request.META.get('REMOTE_ADDR', '-')
    )
    user = getattr(request, 'user', None)
    user_id = (
        str(getattr(user, 'id', 'unknown'))
        if user and getattr(user, 'is_authenticated', False)
        else 'anonymous'
    )
    personnel_code = (request.data.get('personnel_code') or '-')
    return request.method, request.path, user_id, client_ip, personnel_code


def _success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response(
        {
            'success': True,
            'message': message,
            'data': data or {},
        },
        status=status_code,
    )


def _error_response(
    message,
    errors=None,
    status_code=status.HTTP_400_BAD_REQUEST,
    request=None,
):
    normalized_errors = _normalize_errors(errors or {})
    method, path, user_id, client_ip, personnel_code = _request_metadata(request)

    if status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        api_logger.error(
            'Auth API error response method=%s path=%s status=%s user_id=%s ip=%s message=%s errors=%s',
            method,
            path,
            status_code,
            user_id,
            client_ip,
            message,
            normalized_errors,
        )
    elif status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        security_logger.warning(
            'Auth security response method=%s path=%s status=%s user_id=%s ip=%s personnel_code=%s message=%s errors=%s',
            method,
            path,
            status_code,
            user_id,
            client_ip,
            personnel_code,
            message,
            normalized_errors,
        )
    elif status_code >= status.HTTP_400_BAD_REQUEST:
        api_logger.warning(
            'Auth client error response method=%s path=%s status=%s user_id=%s ip=%s personnel_code=%s message=%s errors=%s',
            method,
            path,
            status_code,
            user_id,
            client_ip,
            personnel_code,
            message,
            normalized_errors,
        )

    return Response(
        {
            'success': False,
            'message': message,
            'errors': normalized_errors,
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
        request = getattr(self, 'request', None)
        method, path, user_id, client_ip, _ = _request_metadata(request)

        if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            message = 'اطلاعات احراز هویت نامعتبر است.'
            security_logger.warning(
                'Authentication exception method=%s path=%s user_id=%s ip=%s exception=%s',
                method,
                path,
                user_id,
                client_ip,
                exc.__class__.__name__,
            )
            return _error_response(
                message,
                {'authentication': [message]},
                status.HTTP_401_UNAUTHORIZED,
                request=request,
            )

        if isinstance(exc, PermissionDenied):
            message = 'شما مجوز انجام این عملیات را ندارید.'
            security_logger.warning(
                'Permission exception method=%s path=%s user_id=%s ip=%s exception=%s',
                method,
                path,
                user_id,
                client_ip,
                exc.__class__.__name__,
            )
            return _error_response(
                message,
                {'permission': [message]},
                status.HTTP_403_FORBIDDEN,
                request=request,
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
            _, _, _, client_ip, personnel_code = _request_metadata(request)
            auth_logger.warning(
                'Login validation failed personnel_code=%s ip=%s errors=%s',
                personnel_code,
                client_ip,
                _normalize_errors(serializer.errors),
            )
            return _error_response(
                'اطلاعات ارسال‌شده نامعتبر است.',
                serializer.errors,
                status.HTTP_400_BAD_REQUEST,
                request=request,
            )

        try:
            result = AuthService.login(
                personnel_code=serializer.validated_data['personnel_code'],
                password=serializer.validated_data['password'],
                request=request,
            )
        except AuthServiceError as exc:
            _, _, _, client_ip, personnel_code = _request_metadata(request)
            auth_logger.warning(
                'Login failed personnel_code=%s ip=%s status=%s reason=%s',
                personnel_code,
                client_ip,
                exc.status_code,
                exc.message,
            )
            return _error_response(
                exc.message,
                exc.errors,
                exc.status_code,
                request=request,
            )

        user = get_profile_user_queryset().get(pk=result.user.pk)
        user_data = UserProfileSerializer(user).data
        _, _, _, client_ip, personnel_code = _request_metadata(request)
        auth_logger.info(
            'Login succeeded user_id=%s personnel_code=%s role=%s ip=%s',
            user.id,
            personnel_code,
            user.role.name if user.role_id else 'unknown',
            client_ip,
        )
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
            method, path, user_id, client_ip, _ = _request_metadata(request)
            auth_logger.warning(
                'Logout failed method=%s path=%s user_id=%s ip=%s status=%s reason=%s',
                method,
                path,
                user_id,
                client_ip,
                exc.status_code,
                exc.message,
            )
            return _error_response(
                exc.message,
                exc.errors,
                exc.status_code,
                request=request,
            )

        method, path, user_id, client_ip, _ = _request_metadata(request)
        auth_logger.info(
            'Logout succeeded method=%s path=%s user_id=%s ip=%s',
            method,
            path,
            user_id,
            client_ip,
        )
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
        user = get_profile_user_queryset().get(pk=request.user.pk)
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
            method, path, user_id, client_ip, _ = _request_metadata(request)
            auth_logger.warning(
                'Token refresh failed method=%s path=%s user_id=%s ip=%s status=%s reason=%s',
                method,
                path,
                user_id,
                client_ip,
                exc.status_code,
                exc.message,
            )
            return _error_response(
                exc.message,
                exc.errors,
                exc.status_code,
                request=request,
            )

        method, path, user_id, client_ip, _ = _request_metadata(request)
        auth_logger.info(
            'Token refresh succeeded method=%s path=%s user_id=%s ip=%s',
            method,
            path,
            user_id,
            client_ip,
        )
        return _success_response('توکن با موفقیت تازه‌سازی شد.', tokens)
