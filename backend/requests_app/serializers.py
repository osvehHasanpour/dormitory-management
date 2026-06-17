from rest_framework import serializers

from ideas.models import IdeaComplaint
from requests_app.models import (
    BoothRequest,
    CleaningRequest,
    InventoryItem,
    ItemRequest,
    MaintenanceRequest,
    RequestBase,
    RequestStatusHistory,
)
from requests_app.selectors.request_selectors import (
    MAX_ITEM_QUANTITY,
    MIN_ITEM_QUANTITY,
    RequestSelector,
)

PERSIAN_REQUIRED_MESSAGE = 'این فیلد الزامی است.'
PERSIAN_BLANK_MESSAGE = 'این فیلد نمی‌تواند خالی باشد.'


class UserSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    personnel_code = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role_name = serializers.SerializerMethodField()

    def get_role_name(self, obj):
        if getattr(obj, 'role_id', None):
            return obj.role.name
        return None


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ('id', 'item_name', 'category', 'quantity', 'description')
        read_only_fields = fields


class RequestBaseSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    request_type_display = serializers.CharField(
        source='get_request_type_display',
        read_only=True,
    )
    user = UserSummarySerializer(read_only=True)
    handled_by = UserSummarySerializer(read_only=True)
    assigned_staff = UserSummarySerializer(read_only=True)
    rejection_reason = serializers.CharField(read_only=True)
    status_timeline = serializers.SerializerMethodField()

    class Meta:
        model = RequestBase
        fields = (
            'id',
            'request_type',
            'request_type_display',
            'status',
            'status_display',
            'description',
            'created_at',
            'updated_at',
            'user',
            'handled_by',
            'assigned_staff',
            'rejection_reason',
            'status_timeline',
            'ai_content_flag',
        )
        read_only_fields = fields

    def get_status_timeline(self, obj):
        history = obj.status_history.all()
        return RequestStatusHistorySerializer(history, many=True).data


class RequestStatusHistorySerializer(serializers.ModelSerializer):
    previous_status_display = serializers.CharField(
        source='get_previous_status_display',
        read_only=True,
    )
    new_status_display = serializers.CharField(
        source='get_new_status_display',
        read_only=True,
    )
    acting_supervisor = UserSummarySerializer(read_only=True)

    class Meta:
        model = RequestStatusHistory
        fields = (
            'id',
            'previous_status',
            'previous_status_display',
            'new_status',
            'new_status_display',
            'acting_supervisor',
            'comment',
            'rejection_reason',
            'created_at',
        )
        read_only_fields = fields


class RequestStatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=RequestBase.Status.choices,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'invalid_choice': 'مقدار وضعیت معتبر نیست.',
        },
    )
    comment = serializers.CharField(required=False, allow_blank=True, default='')
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default='')
    assigned_staff = serializers.PrimaryKeyRelatedField(
        queryset=RequestSelector.get_assignable_staff_queryset(),
        required=False,
        allow_null=True,
        error_messages={
            'does_not_exist': 'کاربر محول‌شده معتبر نیست.',
        },
    )

    def validate(self, attrs):
        if attrs['status'] == RequestBase.Status.REJECTED and not attrs.get('rejection_reason', '').strip():
            raise serializers.ValidationError({
                'rejection_reason': ['در صورت رد درخواست، ذکر دلیل الزامی است.'],
            })
        return attrs


class MaintenanceRequestDetailSerializer(RequestBaseSerializer):
    location = serializers.CharField(read_only=True)
    extra_description = serializers.CharField(read_only=True)
    photo_url = serializers.ImageField(read_only=True)

    class Meta(RequestBaseSerializer.Meta):
        model = MaintenanceRequest
        fields = RequestBaseSerializer.Meta.fields + (
            'location',
            'extra_description',
            'photo_url',
        )


class MaintenanceRequestCreateSerializer(serializers.ModelSerializer):
    description = serializers.CharField(
        required=True,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    location = serializers.CharField(
        required=True,
        max_length=200,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    extra_description = serializers.CharField(required=False, allow_blank=True)
    photo_url = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = MaintenanceRequest
        fields = ('description', 'location', 'extra_description', 'photo_url')


class CleaningRequestDetailSerializer(RequestBaseSerializer):
    location = serializers.CharField(read_only=True)
    preferred_date = serializers.DateField(read_only=True)
    extra_description = serializers.CharField(read_only=True)

    class Meta(RequestBaseSerializer.Meta):
        model = CleaningRequest
        fields = RequestBaseSerializer.Meta.fields + (
            'location',
            'preferred_date',
            'extra_description',
        )


class CleaningRequestCreateSerializer(serializers.ModelSerializer):
    description = serializers.CharField(
        required=True,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    location = serializers.CharField(
        required=True,
        max_length=200,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    preferred_date = serializers.DateField(
        required=True,
        error_messages={'required': PERSIAN_REQUIRED_MESSAGE},
    )
    extra_description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CleaningRequest
        fields = ('description', 'location', 'preferred_date', 'extra_description')


class ItemSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ('id', 'item_name', 'category', 'quantity')
        read_only_fields = fields


class ItemRequestDetailSerializer(RequestBaseSerializer):
    quantity = serializers.IntegerField(read_only=True)
    delivery_status = serializers.CharField(read_only=True)
    item = ItemSummarySerializer(read_only=True)

    class Meta(RequestBaseSerializer.Meta):
        model = ItemRequest
        fields = RequestBaseSerializer.Meta.fields + (
            'item',
            'quantity',
            'delivery_status',
        )


class ItemRequestCreateSerializer(serializers.ModelSerializer):
    description = serializers.CharField(
        required=True,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    item = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'does_not_exist': 'کالای انتخاب‌شده یافت نشد.',
        },
    )
    quantity = serializers.IntegerField(
        min_value=MIN_ITEM_QUANTITY,
        max_value=MAX_ITEM_QUANTITY,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'min_value': f'تعداد باید حداقل {MIN_ITEM_QUANTITY} باشد.',
            'max_value': f'تعداد نباید بیشتر از {MAX_ITEM_QUANTITY} باشد.',
        },
    )
    delivery_status = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ItemRequest
        fields = ('description', 'item', 'quantity', 'delivery_status')


class BoothRequestDetailSerializer(RequestBaseSerializer):
    name = serializers.CharField(read_only=True)
    category = serializers.CharField(read_only=True)
    event_date = serializers.DateField(read_only=True)
    approval_date = serializers.DateField(read_only=True)

    class Meta(RequestBaseSerializer.Meta):
        model = BoothRequest
        fields = RequestBaseSerializer.Meta.fields + (
            'name',
            'category',
            'event_date',
            'approval_date',
        )


class BoothRequestCreateSerializer(serializers.ModelSerializer):
    description = serializers.CharField(
        required=True,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    name = serializers.CharField(
        required=True,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    category = serializers.CharField(
        required=True,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'blank': PERSIAN_BLANK_MESSAGE,
        },
    )
    event_date = serializers.DateField(
        required=True,
        error_messages={'required': PERSIAN_REQUIRED_MESSAGE},
    )

    class Meta:
        model = BoothRequest
        fields = ('description', 'name', 'category', 'event_date')


def serialize_request_detail(request_obj):
    mapping = {
        RequestBase.RequestType.MAINTENANCE: MaintenanceRequestDetailSerializer,
        RequestBase.RequestType.CLEANING: CleaningRequestDetailSerializer,
        RequestBase.RequestType.ITEM: ItemRequestDetailSerializer,
        RequestBase.RequestType.BOOTH: BoothRequestDetailSerializer,
    }
    serializer_class = mapping[request_obj.request_type]
    return serializer_class(request_obj).data


class FeedbackCreateSerializer(serializers.Serializer):
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
    category = serializers.ChoiceField(
        choices=IdeaComplaint.Category.choices,
        error_messages={
            'required': PERSIAN_REQUIRED_MESSAGE,
            'invalid_choice': 'دسته‌بندی معتبر نیست.',
        },
    )


class FeedbackAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    personnel_code = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class FeedbackDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    type_display = serializers.CharField()
    category = serializers.CharField(allow_null=True, required=False)
    category_display = serializers.CharField(allow_null=True, required=False)
    title = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.CharField()
    supervisor_response = serializers.CharField()
    response_text = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(required=False, allow_null=True)
    responded_at = serializers.DateTimeField(required=False, allow_null=True)
    responded_within_sla = serializers.BooleanField(required=False, allow_null=True)
    author = FeedbackAuthorSerializer()
