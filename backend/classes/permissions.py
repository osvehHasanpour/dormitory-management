from rest_framework.permissions import IsAuthenticated

from core.api.permissions import IsStudent, IsSupervisor, is_supervisor


class CanManageClasses(IsAuthenticated):
    message = 'این عملیات فقط برای سرپرست مجاز است.'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return is_supervisor(request.user)


__all__ = ['CanManageClasses', 'IsStudent', 'IsSupervisor']
