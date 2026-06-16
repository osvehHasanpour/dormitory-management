import graphene

from requests_app.exceptions import RequestServiceError
from requests_app.services.request_service import RequestService
from dormitory.schema.types import (
    ChangeRequestStatusDataType,
    ChangeRequestStatusResponseType,
    map_request,
)


class ChangeRequestStatus(graphene.Mutation):
    class Arguments:
        request_id = graphene.Int(required=True)
        new_status = graphene.String(required=True)

    Output = ChangeRequestStatusResponseType

    def mutate(self, info, request_id, new_status):
        user = info.context.user
        if not user or not user.is_authenticated:
            return ChangeRequestStatusResponseType(
                success=False,
                message='اطلاعات احراز هویت نامعتبر است.',
                data=None,
                errors={'authentication': ['برای انجام این عملیات باید وارد سیستم شوید.']},
            )

        try:
            request_obj = RequestService.change_status(
                actor=user,
                request_id=request_id,
                new_status=new_status,
            )
        except RequestServiceError as exc:
            return ChangeRequestStatusResponseType(
                success=False,
                message=exc.message,
                data=None,
                errors=exc.errors,
            )

        return ChangeRequestStatusResponseType(
            success=True,
            message='وضعیت درخواست با موفقیت به‌روزرسانی شد.',
            data=ChangeRequestStatusDataType(request=map_request(request_obj)),
            errors=None,
        )


class Mutation(graphene.ObjectType):
    change_request_status = ChangeRequestStatus.Field()
