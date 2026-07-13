import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger('rest_framework')


def custom_exception_handler(exc, context):
    """
    Central DRF exception handler.

    - Uses DRF's default behavior for known API exceptions.
    - Logs full exception tracebacks to configured handlers.
    - Returns a sanitized generic response for unexpected 500-level failures.
    """
    response = drf_exception_handler(exc, context)

    request = context.get('request')
    view = context.get('view')
    view_name = view.__class__.__name__ if view else 'UnknownView'
    method = getattr(request, 'method', 'UNKNOWN')
    path = getattr(request, 'path', 'unknown-path')

    if response is not None:
        # Keep original DRF response payload/status for handled API exceptions,
        # but still log with traceback for debugging and auditing.
        log_message = (
            'Handled API exception in %s %s (%s), status=%s'
            % (method, path, view_name, response.status_code)
        )
        if response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
            logger.error(log_message, exc_info=True)
        else:
            logger.warning(log_message, exc_info=True)
        return response

    # Unexpected/unhandled exception: log stack trace and return a safe payload.
    logger.error(
        'Unhandled API exception in %s %s (%s)',
        method,
        path,
        view_name,
        exc_info=True,
    )
    return Response(
        {'detail': 'An unexpected error occurred. Please try again later.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
