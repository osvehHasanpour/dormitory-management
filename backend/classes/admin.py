from django.contrib import admin

from classes.models import Class, ClassRegistration, Rating


class ClassRegistrationInline(admin.TabularInline):
    model = ClassRegistration
    extra = 0
    readonly_fields = ('registered_at', 'cancelled_at')


class RatingInline(admin.TabularInline):
    model = Rating
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'capacity', 'location', 'start_datetime', 'teacher', 'created_by')
    list_filter = ('category', 'status')
    search_fields = ('title',)
    inlines = [ClassRegistrationInline, RatingInline]


@admin.register(ClassRegistration)
class ClassRegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'class_instance', 'registered_at', 'is_cancelled', 'cancelled_at')
    list_filter = ('is_cancelled',)


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'class_instance', 'score', 'comment', 'created_at')
    list_filter = ('score',)
