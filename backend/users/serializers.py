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
            'is_active',
        )
        read_only_fields = fields

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_role_name(self, obj):
        if not obj.role_id:
            return None

        return obj.role.name

    def _get_current_assignment(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {}).get('room_assignments')
        if prefetched is not None:
            for assignment in prefetched:
                if assignment.is_current:
                    return assignment
            return None

        return obj.room_assignments.filter(is_current=True).select_related('room__block').first()

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_block_name(self, obj):
        if obj.block_id:
            return obj.block.name

        assignment = self._get_current_assignment(obj)
        if assignment and assignment.room.block_id:
            return assignment.room.block.name

        return None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_room_number(self, obj):
        assignment = self._get_current_assignment(obj)
        if assignment:
            return assignment.room.room_number

        return None
