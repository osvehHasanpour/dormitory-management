from rest_framework import serializers


class NotificationDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    message = serializers.CharField()
    is_read = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    related_request_id = serializers.IntegerField(allow_null=True)
