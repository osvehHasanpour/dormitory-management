from django.contrib import admin

from announcements.models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title', 'content')
    readonly_fields = ('created_at',)
