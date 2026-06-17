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
    user_vote = serializers.CharField(allow_null=True)
    is_owner = serializers.BooleanField()
    supervisor_response = serializers.CharField()
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
