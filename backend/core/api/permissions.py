from rest_framework.permissions import BasePermission

from users.models import Role


def _user_role_name(user):
    if not user or not getattr(user, 'is_authenticated', False) or not user.is_authenticated:
        return None
    if not user.role_id:
        return None
    return user.role.name


def is_student(user):
    return _user_role_name(user) == Role.Name.STUDENT


def is_supervisor(user):
    return _user_role_name(user) == Role.Name.SUPERVISOR


def is_admin(user):
    return _user_role_name(user) == Role.Name.ADMIN


def is_supervisor_or_admin(user):
    role_name = _user_role_name(user)
    return role_name in (Role.Name.SUPERVISOR, Role.Name.ADMIN)


def has_role_permission(request, allowed_roles):
    if not request or not getattr(request, 'user', None):
        return False

    user = request.user
    if not user.is_authenticated:
        return False

    role_name = _user_role_name(user)
    if role_name is None:
        return False

    normalized_roles = {
        role.value if hasattr(role, 'value') else role
        for role in allowed_roles
    }
    return role_name in normalized_roles


class IsStudent(BasePermission):
    message = 'این عملیات فقط برای دانشجویان مجاز است.'

    def has_permission(self, request, view):
        return is_student(request.user)


class IsSupervisor(BasePermission):
    message = 'این عملیات فقط برای سرپرست مجاز است.'

    def has_permission(self, request, view):
        return is_supervisor(request.user)


class IsAdmin(BasePermission):
    message = 'این عملیات فقط برای مدیر مجاز است.'

    def has_permission(self, request, view):
        return is_admin(request.user)


class IsSupervisorOrAdmin(BasePermission):
    message = 'این عملیات فقط برای سرپرست یا مدیر مجاز است.'

    def has_permission(self, request, view):
        return is_supervisor_or_admin(request.user)
