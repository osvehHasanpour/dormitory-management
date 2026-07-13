import logging
import time

from django.conf import settings

access_logger = logging.getLogger('api.access')
security_logger = logging.getLogger('security')


class ApiRequestLoggingMiddleware:
    """
    Log request/response cycles for observability and security auditing.

    This middleware emits:
    - INFO logs for successful requests
    - WARNING logs for client errors (including 401/403/404)
    - ERROR logs for server-side failures and unhandled exceptions
    """

    def __init__(self, get_response):
        self.get_response = get_response

    @staticmethod
    def _client_ip(request):
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '-')

    @staticmethod
    def _user_id(request):
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return 'anonymous'
        return str(getattr(user, 'id', 'unknown'))

    @staticmethod
    def _should_skip(path):
        return bool(
            path.startswith(settings.STATIC_URL)
            or path.startswith(settings.MEDIA_URL)
        )

    def __call__(self, request):
        path = request.path or '/'
        if self._should_skip(path):
            return self.get_response(request)

        start_time = time.monotonic()
        method = request.method
        full_path = request.get_full_path()
        user_id = self._user_id(request)
        client_ip = self._client_ip(request)

        if settings.DEBUG:
            access_logger.debug(
                'Request started method=%s path=%s user_id=%s ip=%s',
                method,
                full_path,
                user_id,
                client_ip,
            )

        try:
            response = self.get_response(request)
        except Exception:
            duration_ms = int((time.monotonic() - start_time) * 1000)
            access_logger.error(
                'Unhandled request exception method=%s path=%s user_id=%s ip=%s duration_ms=%s',
                method,
                full_path,
                user_id,
                client_ip,
                duration_ms,
                exc_info=True,
            )
            raise

        status_code = response.status_code
        duration_ms = int((time.monotonic() - start_time) * 1000)
        log_message = (
            'Request completed method=%s path=%s status=%s user_id=%s ip=%s duration_ms=%s'
        )
        log_args = (method, full_path, status_code, user_id, client_ip, duration_ms)

        if status_code >= 500:
            access_logger.error(log_message, *log_args)
        elif status_code in (401, 403):
            security_logger.warning(log_message, *log_args)
        elif status_code == 404:
            access_logger.warning(log_message, *log_args)
        elif status_code >= 400:
            access_logger.warning(log_message, *log_args)
        else:
            access_logger.info(log_message, *log_args)

        return response
