from django.db import transaction
from django.utils import timezone
from rest_framework import status

from classes.exceptions import ClassServiceError
from classes.models import Class, ClassRegistration
from classes.selectors.supervisor_class_selectors import SupervisorClassSelector
from core.api.permissions import is_supervisor
from users.models import User


class SupervisorClassService:
    @staticmethod
    def _ensure_supervisor(user):
        if not is_supervisor(user):
            raise ClassServiceError(
                'این عملیات فقط برای سرپرست مجاز است.',
                {'permission': ['دسترسی فقط برای سرپرست مجاز است.']},
                status.HTTP_403_FORBIDDEN,
            )

    @classmethod
    def _validate_datetimes(cls, *, start_datetime, end_datetime, is_create=False):
        now = timezone.now()
        errors = {}

        if is_create and start_datetime <= now:
            errors['start_datetime'] = ['زمان شروع باید در آینده باشد.']

        if end_datetime <= start_datetime:
            errors['end_datetime'] = ['زمان پایان باید بعد از زمان شروع باشد.']

        if errors:
            raise ClassServiceError(
                'اطلاعات زمان کلاس نامعتبر است.',
                errors,
            )

    @classmethod
    def _get_teacher(cls, teacher_id):
        try:
            teacher = User.objects.select_related('role').get(pk=teacher_id, is_active=True)
        except User.DoesNotExist as exc:
            raise ClassServiceError(
                'مدرس انتخاب‌شده یافت نشد.',
                {'teacher_id': ['شناسه مدرس نامعتبر است.']},
                status.HTTP_400_BAD_REQUEST,
            ) from exc
        return teacher

    @classmethod
    def _validate_capacity(cls, capacity):
        if capacity < 1:
            raise ClassServiceError(
                'ظرفیت کلاس نامعتبر است.',
                {'capacity': ['ظرفیت باید حداقل ۱ نفر باشد.']},
            )

    @classmethod
    def _validate_status(cls, status_value):
        valid_statuses = {choice.value for choice in Class.Status}
        if status_value not in valid_statuses:
            raise ClassServiceError(
                'وضعیت کلاس نامعتبر است.',
                {'status': ['وضعیت انتخاب‌شده معتبر نیست.']},
            )

    @classmethod
    def _validate_category(cls, category):
        valid_categories = {choice.value for choice in Class.Category}
        if category not in valid_categories:
            raise ClassServiceError(
                'دسته‌بندی کلاس نامعتبر است.',
                {'category': ['دسته‌بندی انتخاب‌شده معتبر نیست.']},
            )

    @classmethod
    def _ensure_capacity_not_below_enrollments(cls, class_obj, new_capacity):
        enrolled_count = ClassRegistration.objects.filter(
            class_instance=class_obj,
            is_cancelled=False,
        ).count()
        if new_capacity < enrolled_count:
            raise ClassServiceError(
                'ظرفیت جدید کمتر از تعداد ثبت‌نام‌شده است.',
                {
                    'capacity': [
                        f'ظرفیت نمی‌تواند کمتر از {enrolled_count} نفر (تعداد ثبت‌نام‌شده) باشد.',
                    ],
                },
            )

    @classmethod
    @transaction.atomic
    def create(cls, *, user, data):
        cls._ensure_supervisor(user)
        cls._validate_category(data['category'])
        cls._validate_capacity(data['capacity'])
        cls._validate_datetimes(
            start_datetime=data['start_datetime'],
            end_datetime=data['end_datetime'],
            is_create=True,
        )
        teacher = cls._get_teacher(data['teacher_id'])

        class_obj = Class.objects.create(
            title=data['title'],
            description=data.get('description', ''),
            location=data.get('location', ''),
            capacity=data['capacity'],
            start_datetime=data['start_datetime'],
            end_datetime=data['end_datetime'],
            category=data['category'],
            status=Class.Status.ACTIVE,
            created_by=user,
            teacher=teacher,
        )
        return SupervisorClassSelector.get_by_id(class_obj.pk)

    @classmethod
    @transaction.atomic
    def update(cls, *, user, class_id, data):
        cls._ensure_supervisor(user)
        class_obj = SupervisorClassSelector.get_by_id(class_id)

        if class_obj.status == Class.Status.CANCELLED:
            raise ClassServiceError(
                'کلاس لغو شده قابل ویرایش نیست.',
                {'status': ['این کلاس لغو شده است.']},
            )

        start_datetime = data.get('start_datetime', class_obj.start_datetime)
        end_datetime = data.get('end_datetime', class_obj.end_datetime)

        if 'start_datetime' in data or 'end_datetime' in data:
            cls._validate_datetimes(
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                is_create=False,
            )

        if 'category' in data:
            cls._validate_category(data['category'])
            class_obj.category = data['category']

        if 'capacity' in data:
            cls._validate_capacity(data['capacity'])
            cls._ensure_capacity_not_below_enrollments(class_obj, data['capacity'])
            class_obj.capacity = data['capacity']

        if 'status' in data:
            cls._validate_status(data['status'])
            class_obj.status = data['status']

        if 'title' in data:
            class_obj.title = data['title']

        if 'description' in data:
            class_obj.description = data['description']

        if 'location' in data:
            class_obj.location = data['location']

        if 'start_datetime' in data:
            class_obj.start_datetime = data['start_datetime']

        if 'end_datetime' in data:
            class_obj.end_datetime = data['end_datetime']

        if 'teacher_id' in data:
            class_obj.teacher = cls._get_teacher(data['teacher_id'])

        update_fields = [
            field
            for field in (
                'title',
                'description',
                'location',
                'capacity',
                'start_datetime',
                'end_datetime',
                'category',
                'status',
                'teacher',
            )
            if field in data or (field == 'teacher' and 'teacher_id' in data)
        ]
        if update_fields:
            class_obj.save(update_fields=update_fields)

        return SupervisorClassSelector.get_by_id(class_obj.pk)

    @classmethod
    @transaction.atomic
    def cancel(cls, *, user, class_id):
        cls._ensure_supervisor(user)
        class_obj = SupervisorClassSelector.get_by_id(class_id)

        if class_obj.status == Class.Status.CANCELLED:
            raise ClassServiceError(
                'این کلاس قبلاً لغو شده است.',
                {'status': ['کلاس از قبل لغو شده است.']},
            )

        class_obj.status = Class.Status.CANCELLED
        class_obj.save(update_fields=['status'])
        return SupervisorClassSelector.get_by_id(class_obj.pk)
