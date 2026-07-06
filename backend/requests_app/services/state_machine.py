from requests_app.exceptions import RequestServiceError
from requests_app.models import RequestBase


COMMON_TRANSITIONS = {
    RequestBase.Status.PENDING: {
        RequestBase.Status.IN_PROGRESS,
        RequestBase.Status.APPROVED,
        RequestBase.Status.REJECTED,
    },
    RequestBase.Status.IN_PROGRESS: {
        RequestBase.Status.APPROVED,
        RequestBase.Status.REJECTED,
        RequestBase.Status.COMPLETED,
    },
    RequestBase.Status.APPROVED: {
        RequestBase.Status.IN_PROGRESS,
        RequestBase.Status.COMPLETED,
        RequestBase.Status.REJECTED,
    },
    RequestBase.Status.REJECTED: set(),
    RequestBase.Status.COMPLETED: set(),
}

MAINTENANCE_TRANSITIONS = {
    RequestBase.Status.PENDING: {
        RequestBase.Status.IN_PROGRESS,
        RequestBase.Status.REJECTED,
    },
    RequestBase.Status.IN_PROGRESS: {
        RequestBase.Status.APPROVED,
        RequestBase.Status.REJECTED,
        RequestBase.Status.COMPLETED,
    },
    RequestBase.Status.APPROVED: {
        RequestBase.Status.COMPLETED,
        RequestBase.Status.REJECTED,
    },
    RequestBase.Status.REJECTED: set(),
    RequestBase.Status.COMPLETED: set(),
}

TRANSITIONS_BY_TYPE = {
    RequestBase.RequestType.MAINTENANCE: MAINTENANCE_TRANSITIONS,
    RequestBase.RequestType.CLEANING: COMMON_TRANSITIONS,
    RequestBase.RequestType.ITEM: COMMON_TRANSITIONS,
    RequestBase.RequestType.BOOTH: COMMON_TRANSITIONS,
}


def get_allowed_transitions(request_type):
    return TRANSITIONS_BY_TYPE.get(request_type, COMMON_TRANSITIONS)


def validate_transition(current_status, new_status, *, request_type=None):
    if current_status == new_status:
        raise RequestServiceError(
            'وضعیت جدید با وضعیت فعلی یکسان است.',
            {'status': ['وضعیت درخواست تغییری نکرده است.']},
        )

    valid_statuses = {choice.value for choice in RequestBase.Status}
    if new_status not in valid_statuses:
        raise RequestServiceError(
            'وضعیت انتخاب‌شده نامعتبر است.',
            {'status': ['مقدار وضعیت معتبر نیست.']},
        )

    transitions = get_allowed_transitions(request_type) if request_type else COMMON_TRANSITIONS
    allowed = transitions.get(current_status, set())
    if new_status not in allowed:
        current_label = RequestBase.Status(current_status).label
        new_label = RequestBase.Status(new_status).label
        raise RequestServiceError(
            f'انتقال از «{current_label}» به «{new_label}» مجاز نیست.',
            {
                'status': [
                    f'انتقال از «{current_label}» به «{new_label}» در گردش کار مجاز نیست.',
                ],
            },
        )
