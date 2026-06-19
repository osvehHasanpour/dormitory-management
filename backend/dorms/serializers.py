from rest_framework import serializers

from dorms.models import Block


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ('id', 'name', 'total_floors')
        read_only_fields = fields


class FloorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    floor = serializers.IntegerField()
    label = serializers.CharField()
