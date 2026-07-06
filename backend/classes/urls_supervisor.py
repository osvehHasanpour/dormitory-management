from django.urls import path

from classes.supervisor_views import (
    SupervisorClassDetailView,
    SupervisorClassEnrollmentsView,
    SupervisorClassListView,
    SupervisorClassRatingsView,
)


app_name = 'supervisor_classes'

urlpatterns = [
    path('', SupervisorClassListView.as_view(), name='class-list'),
    path('<int:pk>/enrollments/', SupervisorClassEnrollmentsView.as_view(), name='class-enrollments'),
    path('<int:pk>/ratings/', SupervisorClassRatingsView.as_view(), name='class-ratings'),
    path('<int:pk>/', SupervisorClassDetailView.as_view(), name='class-detail'),
]
