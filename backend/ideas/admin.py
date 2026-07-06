from django.contrib import admin

from ideas.models import IdeaComplaint, Vote


class VoteInline(admin.TabularInline):
    model = Vote
    extra = 0
    readonly_fields = ('voted_at',)


@admin.register(IdeaComplaint)
class IdeaComplaintAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'type',
        'category',
        'status',
        'user',
        'responded_within_sla',
        'created_at',
        'upvotes',
    )
    list_filter = ('type', 'status', 'category', 'responded_within_sla')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at', 'responded_at', 'responded_within_sla')
    inlines = [VoteInline]


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'idea', 'vote_type', 'voted_at')
    list_filter = ('vote_type',)
