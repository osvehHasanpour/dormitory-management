"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from dormitory.graphql_views import JWTGraphQLView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include(('users.urls', 'users'), namespace='users')),
    path(
        'api/v1/requests/',
        include(('requests_app.urls', 'requests_app'), namespace='requests'),
    ),
    path(
        'api/v1/classes/',
        include(('classes.urls', 'classes'), namespace='classes'),
    ),
    path(
        'api/v1/ideas/',
        include(('ideas.urls', 'ideas'), namespace='ideas'),
    ),
    path(
        'api/v1/complaints/',
        include(('requests_app.urls_complaints', 'complaints'), namespace='complaints'),
    ),
    path(
        'api/v1/suggestions/',
        include(('requests_app.urls_suggestions', 'suggestions'), namespace='suggestions'),
    ),
    path('graphql/', JWTGraphQLView.as_view(graphiql=settings.DEBUG), name='graphql'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui',
    ),
]

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
