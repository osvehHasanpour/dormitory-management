from django.urls import path

from announcements.views import AnnouncementDetailView, AnnouncementListView

urlpatterns = [
    path('', AnnouncementListView.as_view(), name='announcement-list'),
    path('<int:pk>/', AnnouncementDetailView.as_view(), name='announcement-detail'),
]
