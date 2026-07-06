from django.urls import path

from classes.views import (
    ClassDetailView,
    ClassListView,
    ClassRateView,
    ClassRegisterView,
    MyClassesView,
    MyEndedClassesView,
)


app_name = 'classes'

urlpatterns = [
    path('my/', MyClassesView.as_view(), name='my-classes'),
    path('my-ended/', MyEndedClassesView.as_view(), name='my-ended-classes'),
    path('', ClassListView.as_view(), name='class-list'),
    path('<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
    path('<int:pk>/register/', ClassRegisterView.as_view(), name='class-register'),
    path('<int:pk>/rate/', ClassRateView.as_view(), name='class-rate'),
]
