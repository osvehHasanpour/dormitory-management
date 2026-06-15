from django.contrib import admin

from core.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'related_request', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('message', 'user__personnel_code')
    readonly_fields = ('created_at',)
