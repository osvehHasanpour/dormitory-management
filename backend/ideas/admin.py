from django.contrib import admin

from ideas.models import IdeaComplaint, Vote


class VoteInline(admin.TabularInline):
    model = Vote
    extra = 0
    readonly_fields = ('voted_at',)


@admin.register(IdeaComplaint)
class IdeaComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'status', 'user', 'upvotes')
    list_filter = ('type', 'status')
    search_fields = ('title', 'description')
    inlines = [VoteInline]


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'idea', 'vote_type', 'voted_at')
    list_filter = ('vote_type',)
