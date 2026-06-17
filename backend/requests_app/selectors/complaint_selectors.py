from ideas.models import IdeaComplaint
from ideas.selectors.supervisor_feedback_selectors import SupervisorFeedbackSelector
from requests_app.exceptions import RequestServiceError
from rest_framework import status


ACTIVE_FEEDBACK_STATUSES = (
    IdeaComplaint.Status.PENDING,
    IdeaComplaint.Status.REVIEWED,
)

MAX_ACTIVE_FEEDBACK_COUNT = 5

FEEDBACK_SELECT_RELATED = ('user', 'user__role')


class ComplaintSelector:
    @classmethod
    def _base_queryset(cls, feedback_type):
        return IdeaComplaint.objects.filter(
            type=feedback_type,
        ).select_related(*FEEDBACK_SELECT_RELATED)

    @classmethod
    def get_my_complaints(cls, user, *, status=None, category=None):
        queryset = cls._base_queryset(IdeaComplaint.Type.COMPLAINT).filter(user=user)
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('-created_at')

    @classmethod
    def get_my_suggestions(cls, user, *, status=None, category=None):
        queryset = cls._base_queryset(IdeaComplaint.Type.SUGGESTION).filter(user=user)
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('-created_at')

    @classmethod
    def get_complaint_for_user(cls, user, pk):
        return cls._get_owned_feedback(
            user,
            pk,
            IdeaComplaint.Type.COMPLAINT,
            'شکایت',
        )

    @classmethod
    def get_suggestion_for_user(cls, user, pk):
        return cls._get_owned_feedback(
            user,
            pk,
            IdeaComplaint.Type.SUGGESTION,
            'پیشنهاد',
        )

    @classmethod
    def _get_owned_feedback(cls, user, pk, feedback_type, label):
        try:
            item = cls._base_queryset(feedback_type).get(pk=pk)
        except IdeaComplaint.DoesNotExist as exc:
            raise RequestServiceError(
                f'{label} مورد نظر یافت نشد.',
                {'id': [f'شناسه {label} نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        if item.user_id != user.id:
            raise RequestServiceError(
                f'شما مجوز مشاهده این {label} را ندارید.',
                {'permission': ['دسترسی به این مورد مجاز نیست.']},
                status.HTTP_403_FORBIDDEN,
            )

        return item

    @classmethod
    def count_active_feedback(cls, user):
        return IdeaComplaint.objects.filter(
            user=user,
            type__in=(
                IdeaComplaint.Type.COMPLAINT,
                IdeaComplaint.Type.SUGGESTION,
            ),
            status__in=ACTIVE_FEEDBACK_STATUSES,
        ).count()

    @classmethod
    def build_feedback_payload(cls, item):
        payload = {
            'id': item.id,
            'type': item.type,
            'type_display': item.get_type_display(),
            'title': item.title,
            'description': item.description,
            'status': item.status,
            'status_display': item.get_status_display(),
            'supervisor_response': item.supervisor_response,
            'author': {
                'id': item.user_id,
                'personnel_code': item.user.personnel_code,
                'first_name': item.user.first_name,
                'last_name': item.user.last_name,
            },
        }
        payload.update(SupervisorFeedbackSelector.build_student_feedback_fields(item))
        return payload
