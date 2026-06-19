from django.urls import include, path
from rest_framework.routers import DefaultRouter

from requests_app.views import (
    BoothRequestViewSet,
    CleaningRequestViewSet,
    InventoryItemListView,
    ItemRequestViewSet,
    MaintenanceRequestViewSet,
    MyRequestsView,
    StudentRequestDetailView,
)


app_name = 'requests'

router = DefaultRouter()
router.register('maintenance', MaintenanceRequestViewSet, basename='maintenance-request')
router.register('cleaning', CleaningRequestViewSet, basename='cleaning-request')
router.register('items', ItemRequestViewSet, basename='item-request')
router.register('booths', BoothRequestViewSet, basename='booth-request')

urlpatterns = [
    path('my/', MyRequestsView.as_view(), name='my-requests'),
    path('<int:pk>/', StudentRequestDetailView.as_view(), name='student-request-detail'),
    path('inventory-items/', InventoryItemListView.as_view(), name='inventory-items'),
    path('', include(router.urls)),
]
