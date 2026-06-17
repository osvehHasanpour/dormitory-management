from rest_framework.permissions import BasePermission

from core.api.permissions import is_supervisor_or_admin


class IsSupervisorOrAdmin(BasePermission):
    message = 'این عملیات فقط برای سرپرست یا مدیر مجاز است.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and is_supervisor_or_admin(request.user)
        )
