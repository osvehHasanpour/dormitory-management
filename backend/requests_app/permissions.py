from rest_framework.permissions import IsAuthenticated

from core.api.permissions import (
    IsStudent,
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


__all__ = [
    'CanAccessRequests',
    'IsStudent',
    'IsSupervisorOrAdmin',
]
