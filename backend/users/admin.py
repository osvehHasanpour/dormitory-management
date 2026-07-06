from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from users.models import Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'personnel_code',
        'first_name',
        'last_name',
        'role',
        'block',
        'is_active',
    )
    list_filter = ('role', 'block', 'is_active')
    search_fields = ('personnel_code', 'national_code', 'first_name', 'last_name')
    ordering = ('personnel_code',)

    fieldsets = (
        (None, {'fields': ('personnel_code', 'password')}),
        ('اطلاعات شخصی', {'fields': ('first_name', 'last_name', 'email', 'national_code')}),
        ('نقش و بلوک', {'fields': ('role', 'block')}),
        ('دسترسی', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('تاریخ‌ها', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'personnel_code',
                'national_code',
                'first_name',
                'last_name',
                'password1',
                'password2',
                'role',
                'block',
            ),
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')
