from django.urls import path

from ideas.supervisor_views import (
    SupervisorFeedbackDetailView,
    SupervisorFeedbackListView,
    SupervisorFeedbackMarkReviewView,
    SupervisorFeedbackRejectView,
    SupervisorFeedbackRespondView,
    SupervisorIdeaReviewView,
)


app_name = 'supervisor_feedback'

urlpatterns = [
    path('', SupervisorFeedbackListView.as_view(), name='feedback-list'),
    path('<int:pk>/review/', SupervisorIdeaReviewView.as_view(), name='idea-review'),
    path('<int:pk>/respond/', SupervisorFeedbackRespondView.as_view(), name='feedback-respond'),
    path('<int:pk>/reject/', SupervisorFeedbackRejectView.as_view(), name='feedback-reject'),
    path('<int:pk>/mark-review/', SupervisorFeedbackMarkReviewView.as_view(), name='feedback-mark-review'),
    path('<int:pk>/', SupervisorFeedbackDetailView.as_view(), name='feedback-detail'),
]
