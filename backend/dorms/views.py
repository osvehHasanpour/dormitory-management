from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.views import APIView

from core.api.responses import EnvelopedAPIViewMixin, error_response, success_response
from dorms.models import Block, Room
from dorms.serializers import BlockSerializer, FloorSerializer


BlockListResponseSerializer = inline_serializer(
    name='BlockListResponse',
    fields={
        'success': serializers.BooleanField(),
        'message': serializers.CharField(),
        'data': serializers.DictField(),
    },
)


class BlockListView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Dorms'],
        summary='لیست بلوک‌ها',
        responses={200: OpenApiResponse(BlockListResponseSerializer)},
    )
    def get(self, request):
        blocks = Block.objects.all().order_by('name')
        serializer = BlockSerializer(blocks, many=True)
        return success_response(
            'لیست بلوک‌ها با موفقیت دریافت شد.',
            {'results': serializer.data},
        )


class BlockFloorsView(EnvelopedAPIViewMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Dorms'],
        summary='لیست طبقات یک بلوک',
        responses={200: OpenApiResponse(BlockListResponseSerializer)},
    )
    def get(self, request, pk):
        try:
            block = Block.objects.get(pk=pk)
        except Block.DoesNotExist:
            return error_response(
                'بلوک یافت نشد.',
                {'block': ['بلوک انتخاب‌شده معتبر نیست.']},
                status.HTTP_404_NOT_FOUND,
            )

        floor_numbers = (
            Room.objects.filter(block=block)
            .values_list('floor', flat=True)
            .distinct()
            .order_by('floor')
        )

        if not floor_numbers:
            floor_numbers = range(1, block.total_floors + 1)

        floors = [
            {
                'id': floor,
                'floor': floor,
                'label': f'طبقه {floor}',
            }
            for floor in floor_numbers
        ]

        serializer = FloorSerializer(floors, many=True)
        return success_response(
            'لیست طبقات با موفقیت دریافت شد.',
            {'results': serializer.data},
        )
