from dataclasses import dataclass

from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken


INVALID_CREDENTIALS_MESSAGE = 'کد پرسنلی یا رمز عبور نادرست است.'
INACTIVE_USER_MESSAGE = 'حساب کاربری شما غیرفعال است.'
MISSING_REFRESH_MESSAGE = 'توکن تازه‌سازی ارسال نشده است.'
INVALID_REFRESH_MESSAGE = 'توکن تازه‌سازی نامعتبر یا منقضی شده است.'


class AuthServiceError(Exception):
    def __init__(self, message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.errors = errors or {}
        self.status_code = status_code
        super().__init__(message)


@dataclass(frozen=True)
class LoginResult:
    user: object
    tokens: dict


class AuthService:
    @classmethod
    def login(cls, *, personnel_code, password, request=None):
        user = cls.validate_credentials(
            personnel_code=personnel_code,
            password=password,
            request=request,
        )

        return LoginResult(
            user=user,
            tokens=cls.generate_tokens(user),
        )

    @staticmethod
    def validate_credentials(*, personnel_code, password, request=None):
        User = get_user_model()

        try:
            user = User.objects.select_related('role').get(personnel_code=personnel_code)
        except User.DoesNotExist as exc:
            raise AuthServiceError(
                INVALID_CREDENTIALS_MESSAGE,
                {'credentials': [INVALID_CREDENTIALS_MESSAGE]},
                status.HTTP_400_BAD_REQUEST,
            ) from exc

        if not user.check_password(password):
            raise AuthServiceError(
                INVALID_CREDENTIALS_MESSAGE,
                {'credentials': [INVALID_CREDENTIALS_MESSAGE]},
                status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            raise AuthServiceError(
                INACTIVE_USER_MESSAGE,
                {'is_active': [INACTIVE_USER_MESSAGE]},
                status.HTTP_403_FORBIDDEN,
            )

        authenticated_user = authenticate(
            request=request,
            personnel_code=personnel_code,
            password=password,
        )
        if authenticated_user is None:
            raise AuthServiceError(
                INVALID_CREDENTIALS_MESSAGE,
                {'credentials': [INVALID_CREDENTIALS_MESSAGE]},
                status.HTTP_400_BAD_REQUEST,
            )

        return User.objects.select_related('role').get(pk=authenticated_user.pk)

    @staticmethod
    def generate_tokens(user):
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @staticmethod
    def refresh_tokens(refresh_token):
        if not refresh_token:
            raise AuthServiceError(
                MISSING_REFRESH_MESSAGE,
                {'refresh': [MISSING_REFRESH_MESSAGE]},
                status.HTTP_400_BAD_REQUEST,
            )

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except (DRFValidationError, InvalidToken, TokenError) as exc:
            raise AuthServiceError(
                INVALID_REFRESH_MESSAGE,
                {'refresh': [INVALID_REFRESH_MESSAGE]},
                status.HTTP_401_UNAUTHORIZED,
            ) from exc

        return dict(serializer.validated_data)

    @staticmethod
    def blacklist_refresh_token(refresh_token):
        if not refresh_token:
            raise AuthServiceError(
                MISSING_REFRESH_MESSAGE,
                {'refresh': [MISSING_REFRESH_MESSAGE]},
                status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except (AttributeError, TokenError) as exc:
            raise AuthServiceError(
                INVALID_REFRESH_MESSAGE,
                {'refresh': [INVALID_REFRESH_MESSAGE]},
                status.HTTP_400_BAD_REQUEST,
            ) from exc
