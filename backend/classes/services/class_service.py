from django.db import transaction
from django.utils import timezone
from rest_framework import status

from classes.exceptions import ClassServiceError
from classes.models import Class, ClassRegistration, Rating
from classes.selectors.class_selectors import ClassSelector
from core.api.permissions import is_student


class ClassService:
    @staticmethod
    def _ensure_student(user):
        if not is_student(user):
            raise ClassServiceError(
                'این عملیات فقط برای دانشجویان مجاز است.',
                {'permission': ['دسترسی فقط برای دانشجویان مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @classmethod
    @transaction.atomic
    def register(cls, *, user, class_id):
        cls._ensure_student(user)

        try:
            class_obj = Class.objects.select_for_update().get(pk=class_id)
        except Class.DoesNotExist as exc:
            raise ClassServiceError(
                'کلاس مورد نظر یافت نشد.',
                {'id': ['شناسه کلاس نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        if class_obj.end_datetime <= timezone.now():
            raise ClassServiceError(
                'ثبت‌نام در کلاس پایان‌یافته امکان‌پذیر نیست.',
                {'class': ['این کلاس به پایان رسیده است.']},
            )

        if class_obj.status != Class.Status.ACTIVE:
            raise ClassServiceError(
                'ثبت‌نام در این کلاس امکان‌پذیر نیست.',
                {'class': ['این کلاس فعال نیست.']},
            )

        active_count = ClassRegistration.objects.filter(
            class_instance=class_obj,
            is_cancelled=False,
        ).count()

        try:
            registration = ClassRegistration.objects.select_for_update().get(
                user=user,
                class_instance=class_obj,
            )
        except ClassRegistration.DoesNotExist:
            if active_count >= class_obj.capacity:
                raise ClassServiceError(
                    'ظرفیت این کلاس تکمیل شده است.',
                    {'capacity': ['ظرفیت کلاس پر است.']},
                )
            registration = ClassRegistration.objects.create(
                user=user,
                class_instance=class_obj,
            )
            return registration

        if not registration.is_cancelled:
            raise ClassServiceError(
                'شما قبلاً در این کلاس ثبت‌نام کرده‌اید.',
                {'registration': ['ثبت‌نام فعال برای این کلاس وجود دارد.']},
            )

        if active_count >= class_obj.capacity:
            raise ClassServiceError(
                'ظرفیت این کلاس تکمیل شده است.',
                {'capacity': ['ظرفیت کلاس پر است.']},
            )

        registration.is_cancelled = False
        registration.cancelled_at = None
        registration.save(update_fields=['is_cancelled', 'cancelled_at'])
        return registration

    @classmethod
    @transaction.atomic
    def cancel_registration(cls, *, user, class_id):
        cls._ensure_student(user)

        try:
            class_obj = Class.objects.get(pk=class_id)
        except Class.DoesNotExist as exc:
            raise ClassServiceError(
                'کلاس مورد نظر یافت نشد.',
                {'id': ['شناسه کلاس نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        if class_obj.end_datetime <= timezone.now():
            raise ClassServiceError(
                'کلاس به پایان رسیده و امکان لغو ثبت‌نام وجود ندارد.',
                {'class': ['این کلاس به پایان رسیده است.']},
            )

        try:
            registration = ClassRegistration.objects.select_for_update().get(
                user=user,
                class_instance=class_obj,
                is_cancelled=False,
            )
        except ClassRegistration.DoesNotExist as exc:
            raise ClassServiceError(
                'شما در این کلاس ثبت‌نام فعال ندارید.',
                {'registration': ['ثبت‌نام فعالی برای لغو یافت نشد.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        registration.is_cancelled = True
        registration.save(update_fields=['is_cancelled', 'cancelled_at'])
        return registration

    @classmethod
    @transaction.atomic
    def submit_rating(cls, *, user, class_id, score, comment=''):
        cls._ensure_student(user)

        try:
            class_obj = Class.objects.get(pk=class_id)
        except Class.DoesNotExist as exc:
            raise ClassServiceError(
                'کلاس مورد نظر یافت نشد.',
                {'id': ['شناسه کلاس نامعتبر است.']},
                status.HTTP_404_NOT_FOUND,
            ) from exc

        if class_obj.end_datetime > timezone.now():
            raise ClassServiceError(
                'امتیازدهی فقط پس از پایان کلاس امکان‌پذیر است.',
                {'class': ['این کلاس هنوز به پایان نرسیده است.']},
            )

        if not ClassRegistration.objects.filter(
            user=user,
            class_instance=class_obj,
            is_cancelled=False,
        ).exists():
            raise ClassServiceError(
                'فقط دانشجویان ثبت‌نام‌شده می‌توانند امتیاز ثبت کنند.',
                {'registration': ['شما در این کلاس ثبت‌نام فعال ندارید.']},
            )

        if Rating.objects.filter(user=user, class_instance=class_obj).exists():
            raise ClassServiceError(
                'شما قبلاً به این کلاس امتیاز داده‌اید.',
                {'rating': ['هر دانشجو فقط یک‌بار می‌تواند امتیاز دهد.']},
            )

        rating = Rating.objects.create(
            user=user,
            class_instance=class_obj,
            score=score,
            comment=comment,
        )
        return ClassSelector.get_class_detail(user, class_id), rating
