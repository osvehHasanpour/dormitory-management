from rest_framework import serializers

PERSIAN_REQUIRED_MESSAGE = 'این فیلد الزامی است.'
PERSIAN_BLANK_MESSAGE = 'این فیلد نمی‌تواند خالی باشد.'


class AuthorSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    personnel_code = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class IdeaDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.CharField()
    type = serializers.CharField()
    type_display = serializers.CharField()
    likes_count = serializers.IntegerField()
    dislikes_count = serializers.IntegerField()
    user_vote = serializers.CharField(allow_null=True, required=False)
    is_owner = serializers.BooleanField()
    supervisor_response = serializers.CharField(required=False, allow_blank=True)
    response_text = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(allow_null=True, required=False)
    category_display = serializers.CharField(allow_null=True, required=False)
    created_at = serializers.DateTimeField(required=False, allow_null=True)
    responded_at = serializers.DateTimeField(required=False, allow_null=True)
    responded_within_sla = serializers.BooleanField(required=False, allow_null=True)
    author = AuthorSummarySerializer()


class IdeaCreateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=200,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
            'max_length': 'عنوان نباید بیشتر از ۲۰۰ کاراکتر باشد.',
        },
    )
    description = serializers.CharField(
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )


class VoteActionSerializer(serializers.Serializer):
    vote_type = serializers.ChoiceField(
        choices=[('up', 'موافق'), ('down', 'مخالف')],
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'invalid_choice': 'نوع رأی باید up یا down باشد.',
        },
    )


class SupervisorUserSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    personnel_code = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    block = serializers.CharField(allow_null=True, required=False)


class SupervisorFeedbackDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    type_display = serializers.CharField()
    category = serializers.CharField(allow_null=True)
    category_display = serializers.CharField(allow_null=True)
    title = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.CharField()
    response_text = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    responded_at = serializers.DateTimeField(allow_null=True)
    responded_within_sla = serializers.BooleanField(allow_null=True)
    is_sla_overdue = serializers.BooleanField()
    author = SupervisorUserSummarySerializer()
    responded_by = SupervisorUserSummarySerializer(allow_null=True)


class IdeaReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=[('approve', 'approve'), ('reject', 'reject')],
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'invalid_choice': 'مقدار action باید approve یا reject باشد.',
        },
    )
    response_text = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if attrs['action'] == 'reject' and not attrs.get('response_text', '').strip():
            raise serializers.ValidationError({
                'response_text': ['در صورت رد ایده، ذکر دلیل الزامی است.'],
            })
        return attrs


class FeedbackResponseSerializer(serializers.Serializer):
    response_text = serializers.CharField(
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )


class FeedbackRejectSerializer(serializers.Serializer):
    response_text = serializers.CharField(
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
