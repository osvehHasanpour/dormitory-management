from django.urls import path

from requests_app.suggestion_views import (
    MySuggestionsView,
    SuggestionCreateView,
    SuggestionDetailView,
)


app_name = 'suggestions'

urlpatterns = [
    path('my/', MySuggestionsView.as_view(), name='my-suggestions'),
    path('<int:pk>/', SuggestionDetailView.as_view(), name='suggestion-detail'),
    path('', SuggestionCreateView.as_view(), name='suggestion-create'),
]
