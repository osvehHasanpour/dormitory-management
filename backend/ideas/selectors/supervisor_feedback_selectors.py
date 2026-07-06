from django.db.models import Q

from ideas.exceptions import IdeaServiceError
from ideas.models import IdeaComplaint
from rest_framework import status


SUPERVISOR_FEEDBACK_SELECT_RELATED = (
    'user',
    'user__role',
    'user__block',
    'responded_by',
    'responded_by__role',
)


class SupervisorFeedbackSelector:
    ORDERING_MAP = {
        'newest': '-created_at',
        'oldest': 'created_at',
    }

    @classmethod
    def _base_queryset(cls):
        return IdeaComplaint.objects.select_related(*SUPERVISOR_FEEDBACK_SELECT_RELATED)

    @classmethod
    def get_supervisor_feed(
        cls,
        *,
        feedback_type=None,
        status=None,
        category=None,
        date_from=None,
        date_to=None,
        search=None,
        ordering='newest',
    ):
        queryset = cls._base_queryset()

        if feedback_type:
            queryset = queryset.filter(type=feedback_type)

        if status:
            queryset = queryset.filter(status=status)

        if category:
            queryset = queryset.filter(category=category)

        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)

        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        if search:
            term = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=term) | Q(description__icontains=term),
            )

        order_field = cls.ORDERING_MAP.get(ordering, '-created_at')
        return queryset.order_by(order_field, '-id')

    @classmethod
    def get_detail_for_supervisor(cls, pk):
        try:
            return cls._base_queryset().get(pk=pk)
        except IdeaComplaint.DoesNotExist as exc:
            raise IdeaServiceError(
                'مورد مورد نظر یافت نشد.',
                {'id': ['شناسه نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def get_for_supervisor_update(cls, pk):
        try:
            return (
                IdeaComplaint.objects.select_for_update()
                .select_related('user')
                .get(pk=pk)
            )
        except IdeaComplaint.DoesNotExist as exc:
            raise IdeaServiceError(
                'مورد مورد نظر یافت نشد.',
                {'id': ['شناسه نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def _user_summary(cls, user):
        if user is None:
            return None
        block_label = None
        if getattr(user, 'block_id', None) and user.block is not None:
            block_label = user.block.name
        return {
            'id': user.id,
            'personnel_code': user.personnel_code,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'block': block_label,
        }

    @classmethod
    def build_supervisor_payload(cls, item):
        return {
            'id': item.id,
            'type': item.type,
            'type_display': item.get_type_display(),
            'category': item.category or None,
            'category_display': item.get_category_display() if item.category else None,
            'title': item.title,
            'description': item.description,
            'status': item.status,
            'status_display': item.get_status_display(),
            'response_text': item.supervisor_response,
            'created_at': item.created_at,
            'updated_at': item.updated_at,
            'responded_at': item.responded_at,
            'responded_within_sla': item.responded_within_sla,
            'is_sla_overdue': item.is_sla_overdue(),
            'author': cls._user_summary(item.user),
            'responded_by': cls._user_summary(item.responded_by),
        }

    @classmethod
    def build_student_feedback_fields(cls, item):
        return {
            'category': item.category or None,
            'category_display': item.get_category_display() if item.category else None,
            'created_at': item.created_at,
            'responded_at': item.responded_at,
            'responded_within_sla': item.responded_within_sla,
            'response_text': item.supervisor_response,
        }
