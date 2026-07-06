from rest_framework.permissions import IsAuthenticated

from core.api.permissions import IsSupervisorOrAdmin, is_supervisor_or_admin


class CanSuperviseFeedback(IsAuthenticated):
    message = 'این عملیات فقط برای سرپرست یا مدیر مجاز است.'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return is_supervisor_or_admin(request.user)


__all__ = ['CanSuperviseFeedback', 'IsSupervisorOrAdmin']
