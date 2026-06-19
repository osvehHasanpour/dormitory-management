from requests_app.models import RequestBase
from requests_app.serializers import serialize_request_detail


def build_request_payload(request_obj):
    data = serialize_request_detail(request_obj)
    data['photo_url'] = _absolute_media_url(request_obj, data.get('photo_url'))
    return data


def _absolute_media_url(request_obj, value):
    if not value:
        return None
    if isinstance(value, str) and value.startswith('http'):
        return value
    return str(value)


def get_child_specific_fields(request_obj):
    if request_obj.request_type == RequestBase.RequestType.MAINTENANCE:
        child = request_obj.maintenancerequest
        return {
            'location': child.location,
            'category': child.category,
            'photo_url': child.photo_url.url if child.photo_url else None,
        }
    if request_obj.request_type == RequestBase.RequestType.CLEANING:
        child = request_obj.cleaningrequest
        return {
            'location': child.location,
            'preferred_date': child.preferred_date.isoformat() if child.preferred_date else None,
            'extra_description': child.extra_description,
        }
    if request_obj.request_type == RequestBase.RequestType.ITEM:
        child = request_obj.itemrequest
        return {
            'item_id': child.item_id,
            'item_name': child.item.item_name if child.item_id else None,
            'quantity': child.quantity,
            'delivery_status': child.delivery_status,
        }
    if request_obj.request_type == RequestBase.RequestType.BOOTH:
        child = request_obj.boothrequest
        return {
            'name': child.name,
            'category': child.category,
            'event_date': child.event_date.isoformat() if child.event_date else None,
            'approval_date': child.approval_date.isoformat() if child.approval_date else None,
        }
    return {}
