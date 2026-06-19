from django.contrib import admin

from requests_app.models import (
    BoothRequest,
    CleaningRequest,
    InventoryItem,
    ItemRequest,
    MaintenanceRequest,
    RequestBase,
    RequestStatusHistory,
)


class RequestStatusHistoryInline(admin.TabularInline):
    model = RequestStatusHistory
    extra = 0
    readonly_fields = (
        'previous_status',
        'new_status',
        'acting_supervisor',
        'comment',
        'rejection_reason',
        'created_at',
    )
    can_delete = False


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'category', 'quantity')
    list_filter = ('category',)
    search_fields = ('item_name',)


@admin.register(RequestBase)
class RequestBaseAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'request_type',
        'status',
        'user',
        'handled_by',
        'assigned_staff',
        'created_at',
    )
    list_filter = ('request_type', 'status')
    search_fields = ('user__personnel_code', 'description')
    readonly_fields = ('created_at', 'updated_at', 'rejection_reason')
    inlines = [RequestStatusHistoryInline]


@admin.register(RequestStatusHistory)
class RequestStatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'request',
        'previous_status',
        'new_status',
        'acting_supervisor',
        'created_at',
    )
    list_filter = ('new_status',)
    readonly_fields = (
        'request',
        'previous_status',
        'new_status',
        'acting_supervisor',
        'comment',
        'rejection_reason',
        'created_at',
    )


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'location', 'category', 'status', 'user', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('location', 'description')


@admin.register(CleaningRequest)
class CleaningRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'location', 'preferred_date', 'status', 'user')
    list_filter = ('status', 'preferred_date')


@admin.register(ItemRequest)
class ItemRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'quantity', 'delivery_status', 'status', 'user')
    list_filter = ('status', 'delivery_status')


@admin.register(BoothRequest)
class BoothRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'event_date', 'status', 'user')
    list_filter = ('status', 'category')
