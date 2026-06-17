from rest_framework import status


class AnnouncementServiceError(Exception):
    def __init__(self, message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.errors = errors or {}
        self.status_code = status_code
        super().__init__(message)
