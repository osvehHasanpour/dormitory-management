import logging

from django.contrib.auth.models import AnonymousUser
from graphene_django.views import GraphQLView
from rest_framework_simplejwt.authentication import JWTAuthentication

security_logger = logging.getLogger('security')


class JWTGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        request.user = AnonymousUser()
        request.auth = None

        authenticator = JWTAuthentication()
        try:
            auth_result = authenticator.authenticate(request)
            if auth_result is not None:
                request.user, request.auth = auth_result
        except Exception:
            security_logger.warning(
                'GraphQL JWT authentication failed; continuing as anonymous user path=%s',
                request.path,
                exc_info=True,
            )
            request.user = AnonymousUser()
            request.auth = None

        return super().dispatch(request, *args, **kwargs)
