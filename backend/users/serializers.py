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
    block_name = serializers.SerializerMethodField()
    room_number = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'personnel_code',
            'first_name',
            'last_name',
            'role_name',
            'block_name',
            'room_number',
            'profile_image',
            'is_active',
        )
        read_only_fields = fields

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_role_name(self, obj):
        if not obj.role_id:
            return None

        return obj.role.name

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_block_name(self, obj):
        if obj.block_id:
            return obj.block.name

        current_assignment = self._get_current_assignment(obj)
        if current_assignment is not None:
            return current_assignment.room.block.name

        return None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_room_number(self, obj):
        current_assignment = self._get_current_assignment(obj)
        if current_assignment is None:
            return None

        return current_assignment.room.room_number

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_profile_image(self, obj):
        return None

    @staticmethod
    def _get_current_assignment(obj):
        for assignment in obj.room_assignments.all():
            if assignment.is_current:
                return assignment

        return None
