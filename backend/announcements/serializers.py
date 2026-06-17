from rest_framework import serializers


class AnnouncementDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    content = serializers.CharField()
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    created_by = serializers.DictField()


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
