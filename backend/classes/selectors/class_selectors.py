from django.db import transaction
from django.db.models import Avg, Count, Exists, F, OuterRef, Prefetch, Q
from django.utils import timezone

from classes.exceptions import ClassServiceError
from classes.models import Class, ClassRegistration, Rating
from rest_framework import status


class ClassSelector:
    @staticmethod
    def _base_queryset():
        return Class.objects.select_related(
            'teacher',
            'created_by',
            'teacher__role',
            'created_by__role',
        )

    @classmethod
    def annotate_capacity_and_ratings(cls, queryset):
        return queryset.annotate(
            active_registered_count=Count(
                'registrations',
                filter=Q(registrations__is_cancelled=False),
            ),
            average_rating=Avg('ratings__score'),
        ).annotate(
            active_remaining_capacity=F('capacity') - F('active_registered_count'),
        )

    @classmethod
    def annotate_user_flags(cls, queryset, user):
        return queryset.annotate(
            is_enrolled=Exists(
                ClassRegistration.objects.filter(
                    class_instance=OuterRef('pk'),
                    user=user,
                    is_cancelled=False,
                ),
            ),
            has_rating=Exists(
                Rating.objects.filter(
                    class_instance=OuterRef('pk'),
                    user=user,
                ),
            ),
        )

    @classmethod
    def get_active_classes(cls, user):
        queryset = cls._base_queryset().filter(
            status=Class.Status.ACTIVE,
            end_datetime__gt=timezone.now(),
        )
        queryset = cls.annotate_capacity_and_ratings(queryset)
        queryset = cls.annotate_user_flags(queryset, user)
        return queryset.order_by('start_datetime')

    @classmethod
    def get_class_detail(cls, user, class_id):
        queryset = cls._base_queryset().filter(pk=class_id)
        queryset = cls.annotate_capacity_and_ratings(queryset)
        queryset = cls.annotate_user_flags(queryset, user)
        try:
            return queryset.get()
        except Class.DoesNotExist as exc:
            raise ClassServiceError(
                'کلاس مورد نظر یافت نشد.',
                {'id': ['شناسه کلاس نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def get_my_active_registrations(cls, user):
        return (
            ClassRegistration.objects.filter(
                user=user,
                is_cancelled=False,
                class_instance__end_datetime__gt=timezone.now(),
            )
            .select_related(
                'class_instance',
                'class_instance__teacher',
                'class_instance__created_by',
            )
            .prefetch_related(
                Prefetch(
                    'class_instance__registrations',
                    queryset=ClassRegistration.objects.filter(is_cancelled=False),
                    to_attr='active_registrations',
                ),
            )
            .order_by('class_instance__start_datetime')
        )

    @classmethod
    def get_my_ended_registrations(cls, user):
        return (
            ClassRegistration.objects.filter(
                user=user,
                is_cancelled=False,
                class_instance__end_datetime__lte=timezone.now(),
            )
            .select_related(
                'class_instance',
                'class_instance__teacher',
                'class_instance__created_by',
            )
            .order_by('-class_instance__end_datetime')
        )

    @classmethod
    def get_user_rating(cls, user, class_instance):
        try:
            return Rating.objects.get(user=user, class_instance=class_instance)
        except Rating.DoesNotExist:
            return None

    @classmethod
    def build_class_payload(cls, class_obj, user):
        now = timezone.now()
        is_ended = class_obj.end_datetime <= now
        is_enrolled = getattr(class_obj, 'is_enrolled', False)
        has_rating = getattr(class_obj, 'has_rating', False)
        registered_count = getattr(
            class_obj,
            'active_registered_count',
            class_obj.registered_count,
        )
        remaining_capacity = getattr(
            class_obj,
            'active_remaining_capacity',
            class_obj.remaining_capacity,
        )
        average_rating = getattr(class_obj, 'average_rating', None)
        user_rating_obj = cls.get_user_rating(user, class_obj) if user else None

        if average_rating is not None:
            average_rating = round(float(average_rating), 1)

        return {
            'id': class_obj.id,
            'title': class_obj.title,
            'description': class_obj.description,
            'location': class_obj.location,
            'category': class_obj.category,
            'category_display': class_obj.get_category_display(),
            'capacity': class_obj.capacity,
            'registered_count': registered_count,
            'remaining_capacity': remaining_capacity,
            'is_full': remaining_capacity <= 0,
            'start_datetime': class_obj.start_datetime,
            'end_datetime': class_obj.end_datetime,
            'day_of_week': class_obj.day_of_week,
            'day_of_week_display': class_obj.get_day_of_week_display() if class_obj.day_of_week else '',
            'start_time': class_obj.start_time,
            'end_time': class_obj.end_time,
            'teacher': cls._serialize_user(class_obj.teacher),
            'created_by': cls._serialize_user(class_obj.created_by),
            'average_rating': average_rating,
            'is_enrolled': is_enrolled,
            'can_rate': is_ended and is_enrolled and not has_rating,
            'user_rating': user_rating_obj.score if user_rating_obj else None,
        }

    @classmethod
    def build_registration_payload(cls, registration, user):
        class_obj = registration.class_instance
        queryset = cls._base_queryset().filter(pk=class_obj.pk)
        queryset = cls.annotate_capacity_and_ratings(queryset)
        queryset = cls.annotate_user_flags(queryset, user)
        annotated_class = queryset.get()
        payload = cls.build_class_payload(annotated_class, user)
        payload['registered_at'] = registration.registered_at
        return payload

    @staticmethod
    def _serialize_user(user):
        if not user:
            return None
        return {
            'id': user.id,
            'personnel_code': user.personnel_code,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role_name': user.role.name if user.role_id else None,
        }
