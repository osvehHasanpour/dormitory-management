from django.db import transaction
from django.db.models import F
from rest_framework import status

from core.api.permissions import is_student
from ideas.exceptions import IdeaServiceError
from ideas.models import IdeaComplaint, Vote
from ideas.selectors.idea_selectors import IdeaSelector


class IdeaService:
    @staticmethod
    def _ensure_student(user):
        if not is_student(user):
            raise IdeaServiceError(
                'فقط دانشجویان می‌توانند ایده ثبت کنند.',
                {'permission': ['ثبت ایده فقط برای دانشجویان مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @classmethod
    @transaction.atomic
    def submit_idea(cls, *, user, data):
        cls._ensure_student(user)
        return IdeaComplaint.objects.create(
            user=user,
            type=IdeaComplaint.Type.IDEA,
            title=data['title'],
            description=data['description'],
            status=IdeaComplaint.Status.PENDING,
        )

    @classmethod
    @transaction.atomic
    def cast_vote(cls, *, user, idea_id, vote_type):
        cls._ensure_student(user)

        try:
            idea = (
                IdeaComplaint.objects.select_for_update()
                .select_related('user')
                .get(
                    pk=idea_id,
                    type=IdeaComplaint.Type.IDEA,
                )
            )
        except IdeaComplaint.DoesNotExist as exc:
            raise IdeaServiceError(
                'ایده مورد نظر یافت نشد.',
                {'id': ['شناسه ایده نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        if idea.user_id == user.id:
            raise IdeaServiceError(
                'امکان رأی دادن به ایده خودتان وجود ندارد.',
                {'permission': ['رأی‌دهی به ایده شخصی مجاز نیست.']},
                status.HTTP_403_FORBIDDEN,
            )

        if idea.status != IdeaComplaint.Status.REVIEWED:
            raise IdeaServiceError(
                'فقط برای ایده‌های تأییدشده می‌توان رأی ثبت کرد.',
                {'status': ['این ایده هنوز تأیید نشده است.']},
                status.HTTP_400_BAD_REQUEST,
            )

        if vote_type not in (Vote.VoteType.UP, Vote.VoteType.DOWN):
            raise IdeaServiceError(
                'نوع رأی نامعتبر است.',
                {'vote_type': ['مقدار رأی باید up یا down باشد.']},
            )

        existing_vote = Vote.objects.select_for_update().filter(
            user=user,
            idea=idea,
        ).first()

        if existing_vote and existing_vote.vote_type == vote_type:
            if existing_vote.vote_type == Vote.VoteType.UP:
                IdeaComplaint.objects.filter(pk=idea.pk).update(
                    upvotes=F('upvotes') - 1,
                )
            existing_vote.delete()
            action = 'removed'
        elif existing_vote:
            old_type = existing_vote.vote_type
            existing_vote.vote_type = vote_type
            existing_vote.save(update_fields=['vote_type'])
            if old_type == Vote.VoteType.UP:
                IdeaComplaint.objects.filter(pk=idea.pk).update(
                    upvotes=F('upvotes') - 1,
                )
            if vote_type == Vote.VoteType.UP:
                IdeaComplaint.objects.filter(pk=idea.pk).update(
                    upvotes=F('upvotes') + 1,
                )
            action = 'replaced'
        else:
            Vote.objects.create(
                user=user,
                idea=idea,
                vote_type=vote_type,
            )
            if vote_type == Vote.VoteType.UP:
                IdeaComplaint.objects.filter(pk=idea.pk).update(
                    upvotes=F('upvotes') + 1,
                )
            action = 'created'

        idea.refresh_from_db()
        return IdeaSelector.get_idea_for_user(user, idea.pk), action
