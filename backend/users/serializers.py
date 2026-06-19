from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from users.models import User


PERSIAN_REQUIRED_MESSAGE = 'این فیلد الزامی است.'
PERSIAN_BLANK_MESSAGE = 'این فیلد نمی‌تواند خالی باشد.'


class LoginSerializer(serializers.Serializer):
    personnel_code = serializers.CharField(
        max_length=20,
        required=True,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
            'max_length': 'کد پرسنلی نمی‌تواند بیش از ۲۰ کاراکتر باشد.',
        },
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        trim_whitespace=False,
        style={'input_type': 'password'},
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )


class UserProfileSerializer(serializers.ModelSerializer):
    role_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'personnel_code',
            'first_name',
            'last_name',
            'role_name',
            'is_active',
        )
        read_only_fields = fields

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_role_name(self, obj):
        if not obj.role_id:
            return None

        return obj.role.name
