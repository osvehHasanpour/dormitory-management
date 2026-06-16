import graphene

from dormitory.schema.utils import build_request_payload, get_child_specific_fields


class UserSummaryType(graphene.ObjectType):
    id = graphene.Int()
    personnel_code = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()
    role_name = graphene.String()


class RequestType(graphene.ObjectType):
    id = graphene.Int()
    request_type = graphene.String()
    request_type_display = graphene.String()
    status = graphene.String()
    status_display = graphene.String()
    description = graphene.String()
    created_at = graphene.DateTime()
    updated_at = graphene.DateTime()
    ai_content_flag = graphene.Boolean()
    user = graphene.Field(UserSummaryType)
    handled_by = graphene.Field(UserSummaryType)
    location = graphene.String()
    extra_description = graphene.String()
    photo_url = graphene.String()
    preferred_date = graphene.String()
    item_id = graphene.Int()
    item_name = graphene.String()
    quantity = graphene.Int()
    delivery_status = graphene.String()
    name = graphene.String()
    category = graphene.String()
    event_date = graphene.String()
    approval_date = graphene.String()


class PaginatedRequestsDataType(graphene.ObjectType):
    total_count = graphene.Int()
    page = graphene.Int()
    page_size = graphene.Int()
    items = graphene.List(RequestType)


class RequestListResponseType(graphene.ObjectType):
    success = graphene.Boolean()
    message = graphene.String()
    data = graphene.Field(PaginatedRequestsDataType)
    errors = graphene.JSONString()


class ChangeRequestStatusDataType(graphene.ObjectType):
    request = graphene.Field(RequestType)


class ChangeRequestStatusResponseType(graphene.ObjectType):
    success = graphene.Boolean()
    message = graphene.String()
    data = graphene.Field(ChangeRequestStatusDataType)
    errors = graphene.JSONString()


def map_user(user):
    if not user:
        return None
    return UserSummaryType(
        id=user.id,
        personnel_code=user.personnel_code,
        first_name=user.first_name,
        last_name=user.last_name,
        role_name=user.role.name if user.role_id else None,
    )


def map_request(request_obj):
    payload = build_request_payload(request_obj)
    child_fields = get_child_specific_fields(request_obj)
    return RequestType(
        id=payload['id'],
        request_type=payload['request_type'],
        request_type_display=payload['request_type_display'],
        status=payload['status'],
        status_display=payload['status_display'],
        description=payload['description'],
        created_at=payload['created_at'],
        updated_at=payload['updated_at'],
        ai_content_flag=payload.get('ai_content_flag'),
        user=map_user(request_obj.user),
        handled_by=map_user(request_obj.handled_by),
        location=child_fields.get('location'),
        extra_description=child_fields.get('extra_description'),
        photo_url=child_fields.get('photo_url'),
        preferred_date=child_fields.get('preferred_date'),
        item_id=child_fields.get('item_id'),
        item_name=child_fields.get('item_name'),
        quantity=child_fields.get('quantity'),
        delivery_status=child_fields.get('delivery_status'),
        name=child_fields.get('name'),
        category=child_fields.get('category'),
        event_date=child_fields.get('event_date'),
        approval_date=child_fields.get('approval_date'),
    )
