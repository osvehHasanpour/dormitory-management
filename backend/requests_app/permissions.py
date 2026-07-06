from rest_framework.permissions import IsAuthenticated

from core.api.permissions import (
    IsStudent,
    IsSupervisor,
    IsSupervisorOrAdmin,
    is_student,
    is_supervisor_or_admin,
)


class CanAccessRequests(IsAuthenticated):
    message = 'برای دسترسی به درخواست‌ها باید وارد سیستم شوید.'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return is_student(request.user) or is_supervisor_or_admin(request.user)


class CanSuperviseRequests(IsAuthenticated):
    message = 'این عملیات فقط برای سرپرست یا مدیر مجاز است.'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return is_supervisor_or_admin(request.user)


__all__ = [
    'CanAccessRequests',
    'CanSuperviseRequests',
    'IsStudent',
    'IsSupervisor',
    'IsSupervisorOrAdmin',
]
