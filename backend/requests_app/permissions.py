from rest_framework.permissions import BasePermission, IsAuthenticated

from core.api.permissions import is_student, is_supervisor_or_admin


class IsStudent(BasePermission):
    message = 'این عملیات فقط برای دانشجویان مجاز است.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and is_student(request.user)
        )


class IsSupervisorOrAdmin(BasePermission):
    message = 'این عملیات فقط برای سرپرست یا مدیر مجاز است.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and is_supervisor_or_admin(request.user)
        )


class CanAccessRequests(IsAuthenticated):
    message = 'برای دسترسی به درخواست‌ها باید وارد سیستم شوید.'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return is_student(request.user) or is_supervisor_or_admin(request.user)
