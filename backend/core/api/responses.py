from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.response import Response


def normalize_errors(errors):
    if isinstance(errors, dict):
        return {key: normalize_errors(value) for key, value in errors.items()}

    if isinstance(errors, list):
        return [normalize_errors(item) for item in errors]

    return str(errors)


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response(
        {
            'success': True,
            'message': message,
            'data': data if data is not None else {},
        },
        status=status_code,
    )


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response(
        {
            'success': False,
            'message': message,
            'errors': normalize_errors(errors or {}),
        },
        status=status_code,
    )


class EnvelopedAPIViewMixin:
    def handle_exception(self, exc):
        if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            message = 'اطلاعات احراز هویت نامعتبر است.'
            return error_response(
                message,
                {'authentication': [message]},
                status.HTTP_401_UNAUTHORIZED,
            )

        if isinstance(exc, PermissionDenied):
            message = 'شما مجوز انجام این عملیات را ندارید.'
            return error_response(
                message,
                {'permission': [message]},
                status.HTTP_403_FORBIDDEN,
            )

        return super().handle_exception(exc)
