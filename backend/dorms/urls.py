from django.urls import path

from dorms.views import BlockFloorsView, BlockListView

app_name = 'dorms'

urlpatterns = [
    path('', BlockListView.as_view(), name='block-list'),
    path('<int:pk>/floors/', BlockFloorsView.as_view(), name='block-floors'),
]
