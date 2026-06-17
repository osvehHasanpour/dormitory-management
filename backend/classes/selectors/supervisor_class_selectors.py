from django.db.models import Avg, Count, Q
from django.utils import timezone

from classes.exceptions import ClassServiceError
from classes.models import Class, ClassRegistration, Rating
from rest_framework import status


class SupervisorClassSelector:
    @staticmethod
    def _base_queryset():
        return Class.objects.select_related(
            'teacher',
            'created_by',
            'teacher__role',
            'created_by__role',
        )

    @classmethod
    def annotate_aggregates(cls, queryset):
        return queryset.annotate(
            enrolled_count=Count(
                'registrations',
                filter=Q(registrations__is_cancelled=False),
            ),
            average_rating=Avg('ratings__score'),
            ratings_count=Count('ratings'),
        )

    @classmethod
    def get_supervisor_list(
        cls,
        *,
        status_filter=None,
        category=None,
        search=None,
        ordering='newest',
    ):
        queryset = cls._base_queryset()
        queryset = cls.annotate_aggregates(queryset)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if category:
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search),
            )

        if ordering == 'oldest':
            return queryset.order_by('start_datetime')
        return queryset.order_by('-start_datetime')

    @classmethod
    def get_by_id(cls, class_id):
        queryset = cls._base_queryset().filter(pk=class_id)
        queryset = cls.annotate_aggregates(queryset)
        try:
            return queryset.get()
        except Class.DoesNotExist as exc:
            raise ClassServiceError(
                'کلاس مورد نظر یافت نشد.',
                {'id': ['شناسه کلاس نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

    @classmethod
    def get_enrollments(cls, class_id):
        cls.get_by_id(class_id)
        return (
            ClassRegistration.objects.filter(
                class_instance_id=class_id,
                is_cancelled=False,
            )
            .select_related('user', 'user__role')
            .order_by('registered_at')
        )

    @classmethod
    def get_ratings(cls, class_id):
        class_obj = cls.get_by_id(class_id)
        ratings = (
            Rating.objects.filter(class_instance_id=class_id)
            .select_related('user', 'user__role')
            .order_by('-created_at')
        )
        return class_obj, ratings

    @classmethod
    def build_supervisor_payload(cls, class_obj):
        enrolled_count = getattr(class_obj, 'enrolled_count', class_obj.registered_count)
        average_rating = getattr(class_obj, 'average_rating', None)
        ratings_count = getattr(class_obj, 'ratings_count', class_obj.ratings.count())

        if average_rating is not None:
            average_rating = round(float(average_rating), 1)

        return {
            'id': class_obj.id,
            'title': class_obj.title,
            'description': class_obj.description,
            'location': class_obj.location,
            'category': class_obj.category,
            'category_display': class_obj.get_category_display(),
            'status': class_obj.status,
            'status_display': class_obj.get_status_display(),
            'capacity': class_obj.capacity,
            'enrolled_count': enrolled_count,
            'remaining_capacity': class_obj.capacity - enrolled_count,
            'is_full': enrolled_count >= class_obj.capacity,
            'start_datetime': class_obj.start_datetime,
            'end_datetime': class_obj.end_datetime,
            'teacher': cls._serialize_user(class_obj.teacher),
            'created_by': cls._serialize_user(class_obj.created_by),
            'average_rating': average_rating,
            'ratings_count': ratings_count,
        }

    @classmethod
    def build_enrollment_payload(cls, registration):
        return {
            'id': registration.id,
            'registered_at': registration.registered_at,
            'student': cls._serialize_user(registration.user),
        }

    @classmethod
    def build_rating_payload(cls, rating):
        return {
            'id': rating.id,
            'score': rating.score,
            'comment': rating.comment,
            'created_at': rating.created_at,
            'student': cls._serialize_user(rating.user),
        }

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
