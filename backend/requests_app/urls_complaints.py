from django.urls import path

from requests_app.complaint_views import (
    ComplaintCreateView,
    ComplaintDetailView,
    MyComplaintsView,
)


app_name = 'complaints'

urlpatterns = [
    path('my/', MyComplaintsView.as_view(), name='my-complaints'),
    path('<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('', ComplaintCreateView.as_view(), name='complaint-create'),
]
