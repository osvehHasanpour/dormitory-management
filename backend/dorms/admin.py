from django.contrib import admin

from dorms.models import Block, Room, RoomAssignment


class RoomInline(admin.TabularInline):
    model = Room
    extra = 0


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_floors')
    search_fields = ('name',)
    inlines = [RoomInline]


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'block', 'floor', 'capacity')
    list_filter = ('block', 'floor')
    search_fields = ('room_number',)


@admin.register(RoomAssignment)
class RoomAssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'assigned_from', 'assigned_to', 'is_current')
    list_filter = ('is_current', 'room__block')
    search_fields = ('user__personnel_code', 'user__first_name', 'room__room_number')
