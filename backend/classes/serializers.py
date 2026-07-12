from rest_framework import serializers

from classes.models import Class

PERSIAN_REQUIRED_MESSAGE = 'این فیلد الزامی است.'


class UserSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    personnel_code = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role_name = serializers.CharField(allow_null=True)


class ClassDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    location = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField()
    category_display = serializers.CharField()
    capacity = serializers.IntegerField()
    registered_count = serializers.IntegerField()
    remaining_capacity = serializers.IntegerField()
    is_full = serializers.BooleanField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    day_of_week = serializers.CharField(allow_blank=True)
    day_of_week_display = serializers.CharField(allow_blank=True)
    start_time = serializers.TimeField(allow_null=True)
    end_time = serializers.TimeField(allow_null=True)
    teacher = UserSummarySerializer(allow_null=True)
    created_by = UserSummarySerializer(allow_null=True)
    average_rating = serializers.FloatField(allow_null=True)
    is_enrolled = serializers.BooleanField()
    can_rate = serializers.BooleanField()
    user_rating = serializers.IntegerField(allow_null=True)
    registered_at = serializers.DateTimeField(required=False, allow_null=True)


class RatingCreateSerializer(serializers.Serializer):
    score = serializers.IntegerField(
        min_value=1,
        max_value=5,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'min_value': 'امتیاز باید بین ۱ تا ۵ باشد.',
            'max_value': 'امتیاز باید بین ۱ تا ۵ باشد.',
            'invalid': 'امتیاز باید عدد صحیح باشد.',
        },
    )
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        error_messages={
            'invalid': 'نظر باید متن معتبر باشد.',
        },
    )


class SupervisorClassCreateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=200,
        error_messages={
            'blank': 'عنوان کلاس نمی‌تواند خالی باشد.',
            'max_length': 'عنوان کلاس نمی‌تواند بیش از ۲۰۰ کاراکتر باشد.',
            'required': 'عنوان کلاس الزامی است.',
        },
    )
    description = serializers.CharField(required=False, allow_blank=True, default='')
    location = serializers.CharField(required=False, allow_blank=True, default='', max_length=200)
    category = serializers.ChoiceField(
        choices=Class.Category.choices,
        error_messages={
            'required': 'دسته‌بندی کلاس الزامی است.',
            'invalid_choice': 'دسته‌بندی انتخاب‌شده معتبر نیست.',
        },
    )
    capacity = serializers.IntegerField(
        min_value=1,
        error_messages={
            'required': 'ظرفیت کلاس الزامی است.',
            'min_value': 'ظرفیت باید حداقل ۱ نفر باشد.',
            'invalid': 'ظرفیت باید عدد صحیح باشد.',
        },
    )
    start_datetime = serializers.DateTimeField(
        error_messages={
            'required': 'زمان شروع الزامی است.',
            'invalid': 'فرمت زمان شروع نامعتبر است.',
        },
    )
    end_datetime = serializers.DateTimeField(
        error_messages={
            'required': 'زمان پایان الزامی است.',
            'invalid': 'فرمت زمان پایان نامعتبر است.',
        },
    )
    day_of_week = serializers.ChoiceField(
        choices=Class.DayOfWeek.choices,
        error_messages={
            'required': 'روز برگزاری الزامی است.',
            'invalid_choice': 'روز برگزاری انتخاب‌شده معتبر نیست.',
        },
    )
    start_time = serializers.TimeField(
        error_messages={
            'required': 'زمان شروع کلاس الزامی است.',
            'invalid': 'فرمت زمان شروع کلاس نامعتبر است.',
        },
    )
    end_time = serializers.TimeField(
        error_messages={
            'required': 'زمان پایان کلاس الزامی است.',
            'invalid': 'فرمت زمان پایان کلاس نامعتبر است.',
        },
    )
    teacher_id = serializers.IntegerField(
        error_messages={
            'required': 'شناسه مدرس الزامی است.',
            'invalid': 'شناسه مدرس باید عدد صحیح باشد.',
        },
    )


class SupervisorClassUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True, max_length=200)
    category = serializers.ChoiceField(choices=Class.Category.choices, required=False)
    capacity = serializers.IntegerField(min_value=1, required=False)
    start_datetime = serializers.DateTimeField(required=False)
    end_datetime = serializers.DateTimeField(required=False)
    day_of_week = serializers.ChoiceField(choices=Class.DayOfWeek.choices, required=False)
    start_time = serializers.TimeField(required=False)
    end_time = serializers.TimeField(required=False)
    teacher_id = serializers.IntegerField(required=False)
    status = serializers.ChoiceField(choices=Class.Status.choices, required=False)


class SupervisorClassDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    location = serializers.CharField()
    category = serializers.CharField()
    category_display = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.CharField()
    capacity = serializers.IntegerField()
    enrolled_count = serializers.IntegerField()
    remaining_capacity = serializers.IntegerField()
    is_full = serializers.BooleanField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    day_of_week = serializers.CharField(allow_blank=True)
    day_of_week_display = serializers.CharField(allow_blank=True)
    start_time = serializers.TimeField(allow_null=True)
    end_time = serializers.TimeField(allow_null=True)
    teacher = UserSummarySerializer(allow_null=True)
    created_by = UserSummarySerializer(allow_null=True)
    average_rating = serializers.FloatField(allow_null=True)
    ratings_count = serializers.IntegerField()


class SupervisorEnrollmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    registered_at = serializers.DateTimeField()
    student = UserSummarySerializer()


class SupervisorRatingOverviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    score = serializers.IntegerField()
    comment = serializers.CharField()
    created_at = serializers.DateTimeField()
    student = UserSummarySerializer()
