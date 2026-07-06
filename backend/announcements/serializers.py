from rest_framework import serializers

PERSIAN_REQUIRED_MESSAGE = 'این فیلد الزامی است.'
PERSIAN_BLANK_MESSAGE = 'این فیلد نمی‌تواند خالی باشد.'


class CreatedBySummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    personnel_code = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    display_name = serializers.CharField()
    avatar = serializers.CharField(allow_null=True, required=False)


class AnnouncementDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    content = serializers.CharField()
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    created_by = CreatedBySummarySerializer()


class AnnouncementCreateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=200,
        error_messages={
            'blank': 'عنوان اطلاعیه نمی‌تواند خالی باشد.',
            'max_length': 'عنوان اطلاعیه نمی‌تواند بیش از ۲۰۰ کاراکتر باشد.',
            'required': 'عنوان اطلاعیه الزامی است.',
        },
    )
    content = serializers.CharField(
        error_messages={
            'blank': 'متن اطلاعیه نمی‌تواند خالی باشد.',
            'required': 'متن اطلاعیه الزامی است.',
        },
    )

    def validate_title(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError('عنوان اطلاعیه نمی‌تواند خالی باشد.')
        return stripped

    def validate_content(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError('متن اطلاعیه نمی‌تواند خالی باشد.')
        return stripped


class AnnouncementUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=200,
        required=False,
        error_messages={
            'blank': 'عنوان اطلاعیه نمی‌تواند خالی باشد.',
            'max_length': 'عنوان اطلاعیه نمی‌تواند بیش از ۲۰۰ کاراکتر باشد.',
        },
    )
    content = serializers.CharField(
        required=False,
        error_messages={
            'blank': 'متن اطلاعیه نمی‌تواند خالی باشد.',
        },
    )

    def validate_title(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError('عنوان اطلاعیه نمی‌تواند خالی باشد.')
        return stripped

    def validate_content(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError('متن اطلاعیه نمی‌تواند خالی باشد.')
        return stripped

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                'حداقل یکی از فیلدهای عنوان یا محتوا باید ارسال شود.',
            )
        return attrs
