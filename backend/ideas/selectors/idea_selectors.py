from django.db.models import Case, CharField, Count, Exists, OuterRef, Q, Value, When

from ideas.exceptions import IdeaServiceError
from ideas.models import IdeaComplaint, Vote
from rest_framework import status


IDEA_DETAIL_SELECT_RELATED = ('user', 'user__role')


class IdeaSelector:
    ORDERING_MAP = {
        'most_votes': '-likes_count',
        'newest': '-id',
        'oldest': 'id',
    }

    @classmethod
    def _base_queryset(cls):
        return IdeaComplaint.objects.filter(
            type=IdeaComplaint.Type.IDEA,
        ).select_related(*IDEA_DETAIL_SELECT_RELATED)

    @classmethod
    def annotate_vote_stats(cls, queryset, user):
        queryset = queryset.annotate(
            likes_count=Count(
                'votes',
                filter=Q(votes__vote_type=Vote.VoteType.UP),
            ),
            dislikes_count=Count(
                'votes',
                filter=Q(votes__vote_type=Vote.VoteType.DOWN),
            ),
        )
        if user and user.is_authenticated:
            queryset = queryset.annotate(
                user_vote=Case(
                    When(
                        Exists(
                            Vote.objects.filter(
                                idea=OuterRef('pk'),
                                user=user,
                                vote_type=Vote.VoteType.UP,
                            ),
                        ),
                        then=Value(Vote.VoteType.UP),
                    ),
                    When(
                        Exists(
                            Vote.objects.filter(
                                idea=OuterRef('pk'),
                                user=user,
                                vote_type=Vote.VoteType.DOWN,
                            ),
                        ),
                        then=Value(Vote.VoteType.DOWN),
                    ),
                    default=Value(None),
                    output_field=CharField(),
                ),
            )
        return queryset

    @classmethod
    def get_public_ideas(cls, user, *, ordering='newest', search=None):
        queryset = cls._base_queryset().filter(status=IdeaComplaint.Status.REVIEWED)
        if search:
            queryset = queryset.filter(title__icontains=search.strip())

        queryset = cls.annotate_vote_stats(queryset, user)
        order_field = cls.ORDERING_MAP.get(ordering, '-id')
        return queryset.order_by(order_field, '-id')

    @classmethod
    def get_my_ideas(cls, user):
        queryset = cls._base_queryset().filter(user=user)
        queryset = cls.annotate_vote_stats(queryset, user)
        return queryset.order_by('-id')

    @classmethod
    def get_idea_for_user(cls, user, idea_id):
        queryset = cls.annotate_vote_stats(
            cls._base_queryset().filter(pk=idea_id),
            user,
        )
        try:
            idea = queryset.get()
        except IdeaComplaint.DoesNotExist as exc:
            raise IdeaServiceError(
                'ایده مورد نظر یافت نشد.',
                {'id': ['شناسه ایده نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        if idea.user_id == user.id:
            return idea

        if idea.status != IdeaComplaint.Status.REVIEWED:
            raise IdeaServiceError(
                'شما مجوز مشاهده این ایده را ندارید.',
                {'permission': ['این ایده هنوز تأیید نشده است.']},
                status.HTTP_403_FORBIDDEN,
            )

        return idea

    @classmethod
    def build_idea_payload(cls, idea, user):
        user_vote = getattr(idea, 'user_vote', None)
        is_owner = user and idea.user_id == user.id
        return {
            'id': idea.id,
            'title': idea.title,
            'description': idea.description,
            'status': idea.status,
            'status_display': idea.get_status_display(),
            'type': idea.type,
            'type_display': idea.get_type_display(),
            'likes_count': getattr(idea, 'likes_count', idea.upvotes),
            'dislikes_count': getattr(idea, 'dislikes_count', 0),
            'user_vote': user_vote,
            'is_owner': is_owner,
            'supervisor_response': idea.supervisor_response if is_owner else '',
            'author': {
                'id': idea.user_id,
                'personnel_code': idea.user.personnel_code,
                'first_name': idea.user.first_name,
                'last_name': idea.user.last_name,
            },
        }
