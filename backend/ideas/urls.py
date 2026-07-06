from django.urls import path

from ideas.views import (
    IdeaDetailView,
    IdeaListCreateView,
    IdeaVoteView,
    MyIdeasView,
)


app_name = 'ideas'

urlpatterns = [
    path('my/', MyIdeasView.as_view(), name='my-ideas'),
    path('<int:pk>/vote/', IdeaVoteView.as_view(), name='idea-vote'),
    path('<int:pk>/', IdeaDetailView.as_view(), name='idea-detail'),
    path('', IdeaListCreateView.as_view(), name='idea-list-create'),
]
