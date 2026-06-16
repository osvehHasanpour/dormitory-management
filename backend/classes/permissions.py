from rest_framework.permissions import BasePermission

from core.api.permissions import is_student


class IsStudent(BasePermission):
    message = 'این عملیات فقط برای دانشجویان مجاز است.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and is_student(request.user)
        )
