from users.models import Role


def is_student(user):
    return bool(
        user
        and user.is_authenticated
        and user.role_id
        and user.role.name == Role.Name.STUDENT
    )


def is_supervisor_or_admin(user):
    return bool(
        user
        and user.is_authenticated
        and user.role_id
        and user.role.name in (Role.Name.SUPERVISOR, Role.Name.ADMIN)
    )
