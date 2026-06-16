from rest_framework import serializers

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
    category = serializers.CharField()
    category_display = serializers.CharField()
    capacity = serializers.IntegerField()
    registered_count = serializers.IntegerField()
    remaining_capacity = serializers.IntegerField()
    is_full = serializers.BooleanField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
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
