from django.contrib.auth.models import AnonymousUser
from graphene_django.views import GraphQLView
from rest_framework_simplejwt.authentication import JWTAuthentication


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
            request.user = AnonymousUser()
            request.auth = None

        return super().dispatch(request, *args, **kwargs)
