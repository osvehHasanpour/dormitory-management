import logging

from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.response import Response

api_logger = logging.getLogger('rest_framework')
security_logger = logging.getLogger('security')


def normalize_errors(errors):
    if isinstance(errors, dict):
        return {key: normalize_errors(value) for key, value in errors.items()}

    if isinstance(errors, list):
        return [normalize_errors(item) for item in errors]

    return str(errors)


def _request_metadata(request):
    if not request:
        return 'UNKNOWN', 'unknown-path', 'anonymous', '-'

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
    return request.method, request.path, user_id, client_ip


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response(
        {
            'success': True,
            'message': message,
            'data': data if data is not None else {},
        },
        status=status_code,
    )


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST, request=None):
    normalized_errors = normalize_errors(errors or {})
    method, path, user_id, client_ip = _request_metadata(request)

    if status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        api_logger.error(
            'API error response method=%s path=%s status=%s user_id=%s ip=%s message=%s errors=%s',
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
            'Security error response method=%s path=%s status=%s user_id=%s ip=%s message=%s errors=%s',
            method,
            path,
            status_code,
            user_id,
            client_ip,
            message,
            normalized_errors,
        )
    elif status_code == status.HTTP_404_NOT_FOUND:
        api_logger.warning(
            'Not found response method=%s path=%s status=%s user_id=%s ip=%s message=%s errors=%s',
            method,
            path,
            status_code,
            user_id,
            client_ip,
            message,
            normalized_errors,
        )
    elif status_code >= status.HTTP_400_BAD_REQUEST:
        api_logger.warning(
            'Client error response method=%s path=%s status=%s user_id=%s ip=%s message=%s errors=%s',
            method,
            path,
            status_code,
            user_id,
            client_ip,
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


class EnvelopedAPIViewMixin:
    def handle_exception(self, exc):
        request = getattr(self, 'request', None)

        if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            message = 'اطلاعات احراز هویت نامعتبر است.'
            method, path, user_id, client_ip = _request_metadata(request)
            security_logger.warning(
                'Authentication error method=%s path=%s user_id=%s ip=%s exception=%s',
                method,
                path,
                user_id,
                client_ip,
                exc.__class__.__name__,
            )
            return error_response(
                message,
                {'authentication': [message]},
                status.HTTP_401_UNAUTHORIZED,
                request=request,
            )

        if isinstance(exc, PermissionDenied):
            message = 'شما مجوز انجام این عملیات را ندارید.'
            method, path, user_id, client_ip = _request_metadata(request)
            security_logger.warning(
                'Permission denied method=%s path=%s user_id=%s ip=%s exception=%s',
                method,
                path,
                user_id,
                client_ip,
                exc.__class__.__name__,
            )
            return error_response(
                message,
                {'permission': [message]},
                status.HTTP_403_FORBIDDEN,
                request=request,
            )

        return super().handle_exception(exc)
