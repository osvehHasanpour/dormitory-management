import graphene

from core.api.permissions import is_supervisor_or_admin
from requests_app.exceptions import RequestServiceError
from requests_app.models import RequestBase
from requests_app.selectors.request_selectors import RequestSelector
from dormitory.schema.types import (
    PaginatedRequestsDataType,
    RequestListResponseType,
    map_request,
)


class Query(graphene.ObjectType):
    all_requests = graphene.Field(
        RequestListResponseType,
        status=graphene.String(),
        request_type=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=20),
    )

    def resolve_all_requests(
        self,
        info,
        status=None,
        request_type=None,
        page=1,
        page_size=20,
    ):
        user = info.context.user
        if not user or not user.is_authenticated:
            return RequestListResponseType(
                success=False,
                message='اطلاعات احراز هویت نامعتبر است.',
                data=None,
                errors={'authentication': ['برای دسترسی باید وارد سیستم شوید.']},
            )

        if not is_supervisor_or_admin(user):
            return RequestListResponseType(
                success=False,
                message='شما مجوز انجام این عملیات را ندارید.',
                data=None,
                errors={'permission': ['این بخش فقط برای سرپرست یا مدیر در دسترس است.']},
            )

        valid_statuses = {choice.value for choice in RequestBase.Status}
        if status and status not in valid_statuses:
            return RequestListResponseType(
                success=False,
                message='فیلتر وضعیت نامعتبر است.',
                data=None,
                errors={'status': ['مقدار وضعیت معتبر نیست.']},
            )

        valid_types = {choice.value for choice in RequestBase.RequestType}
        if request_type and request_type not in valid_types:
            return RequestListResponseType(
                success=False,
                message='فیلتر نوع درخواست نامعتبر است.',
                data=None,
                errors={'request_type': ['نوع درخواست معتبر نیست.']},
            )

        if page < 1:
            return RequestListResponseType(
                success=False,
                message='شماره صفحه نامعتبر است.',
                data=None,
                errors={'page': ['شماره صفحه باید بزرگ‌تر از صفر باشد.']},
            )

        if page_size < 1 or page_size > 100:
            return RequestListResponseType(
                success=False,
                message='اندازه صفحه نامعتبر است.',
                data=None,
                errors={'page_size': ['اندازه صفحه باید بین ۱ تا ۱۰۰ باشد.']},
            )

        try:
            paginated = RequestSelector.get_supervisor_feed(
                user,
                status=status,
                request_type=request_type,
                page=page,
                page_size=page_size,
            )
        except RequestServiceError as exc:
            return RequestListResponseType(
                success=False,
                message=exc.message,
                data=None,
                errors=exc.errors,
            )

        return RequestListResponseType(
            success=True,
            message='لیست درخواست‌ها با موفقیت دریافت شد.',
            data=PaginatedRequestsDataType(
                total_count=paginated['total_count'],
                page=paginated['page'],
                page_size=paginated['page_size'],
                items=[map_request(item) for item in paginated['items']],
            ),
            errors=None,
        )
