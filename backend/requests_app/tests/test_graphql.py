import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Notification
from requests_app.models import CleaningRequest, MaintenanceRequest, RequestBase
from users.models import Role, User


ALL_REQUESTS_QUERY = """
query AllRequests($status: String, $requestType: String, $page: Int, $pageSize: Int) {
  allRequests(status: $status, requestType: $requestType, page: $page, pageSize: $pageSize) {
    success
    message
    errors
    data {
      totalCount
      page
      pageSize
      items {
        id
        requestType
        status
        description
      }
    }
  }
}
"""

CHANGE_STATUS_MUTATION = """
mutation ChangeRequestStatus($requestId: Int!, $newStatus: String!) {
  changeRequestStatus(requestId: $requestId, newStatus: $newStatus) {
    success
    message
    errors
    data {
      request {
        id
        status
        handledBy {
          personnelCode
        }
      }
    }
  }
}
"""


class GraphQLRequestsTests(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(name=Role.Name.STUDENT, description='دانشجو')
        self.supervisor_role = Role.objects.create(
            name=Role.Name.SUPERVISOR,
            description='سرپرست',
        )

        self.student = User.objects.create(
            personnel_code='401234567',
            national_code='1234567890',
            first_name='علی',
            last_name='رضایی',
            role=self.student_role,
        )
        self.student.set_password('student-pass')
        self.student.save()

        self.supervisor = User.objects.create(
            personnel_code='9001001',
            national_code='2234567890',
            first_name='حسین',
            last_name='کریمی',
            role=self.supervisor_role,
        )
        self.supervisor.set_password('supervisor-pass')
        self.supervisor.save()

        self.maintenance_request = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )
        self.cleaning_request = CleaningRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.CLEANING,
            description='نظافت راهرو',
            location='بلوک ب',
            preferred_date='2026-06-20',
        )

    def _graphql(self, query, variables=None, user=None):
        headers = {}
        if user is not None:
            refresh = RefreshToken.for_user(user)
            headers['HTTP_AUTHORIZATION'] = f'Bearer {refresh.access_token}'

        return self.client.post(
            reverse('graphql'),
            data=json.dumps({'query': query, 'variables': variables or {}}),
            content_type='application/json',
            **headers,
        )

    def test_supervisor_can_query_all_requests(self):
        response = self._graphql(
            ALL_REQUESTS_QUERY,
            variables={'page': 1, 'pageSize': 10},
            user=self.supervisor,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()['data']['allRequests']
        self.assertTrue(payload['success'])
        self.assertEqual(payload['data']['totalCount'], 2)
        self.assertEqual(len(payload['data']['items']), 2)

    def test_student_cannot_query_all_requests(self):
        response = self._graphql(
            ALL_REQUESTS_QUERY,
            variables={'page': 1, 'pageSize': 10},
            user=self.student,
        )

        payload = response.json()['data']['allRequests']
        self.assertFalse(payload['success'])
        self.assertIn('permission', payload['errors'])

    def test_unauthenticated_graphql_query_returns_auth_error(self):
        response = self._graphql(
            ALL_REQUESTS_QUERY,
            variables={'page': 1, 'pageSize': 10},
        )

        payload = response.json()['data']['allRequests']
        self.assertFalse(payload['success'])
        self.assertIn('authentication', payload['errors'])

    def test_supervisor_can_change_request_status(self):
        response = self._graphql(
            CHANGE_STATUS_MUTATION,
            variables={
                'requestId': self.maintenance_request.pk,
                'newStatus': RequestBase.Status.IN_PROGRESS,
            },
            user=self.supervisor,
        )

        payload = response.json()['data']['changeRequestStatus']
        self.assertTrue(payload['success'])
        self.assertEqual(payload['data']['request']['status'], RequestBase.Status.IN_PROGRESS)
        self.assertEqual(
            payload['data']['request']['handledBy']['personnelCode'],
            self.supervisor.personnel_code,
        )

        self.maintenance_request.refresh_from_db()
        self.assertEqual(self.maintenance_request.status, RequestBase.Status.IN_PROGRESS)

    def test_invalid_status_transition_returns_persian_error(self):
        response = self._graphql(
            CHANGE_STATUS_MUTATION,
            variables={
                'requestId': self.maintenance_request.pk,
                'newStatus': RequestBase.Status.COMPLETED,
            },
            user=self.supervisor,
        )

        payload = response.json()['data']['changeRequestStatus']
        self.assertFalse(payload['success'])
        self.assertIn('مجاز نیست', payload['message'])

    def test_status_change_creates_notification(self):
        initial_count = Notification.objects.filter(user=self.student).count()

        response = self._graphql(
            CHANGE_STATUS_MUTATION,
            variables={
                'requestId': self.maintenance_request.pk,
                'newStatus': RequestBase.Status.IN_PROGRESS,
            },
            user=self.supervisor,
        )

        self.assertTrue(response.json()['data']['changeRequestStatus']['success'])
        self.assertEqual(
            Notification.objects.filter(user=self.student).count(),
            initial_count + 1,
        )

    def test_student_cannot_change_request_status(self):
        response = self._graphql(
            CHANGE_STATUS_MUTATION,
            variables={
                'requestId': self.maintenance_request.pk,
                'newStatus': RequestBase.Status.IN_PROGRESS,
            },
            user=self.student,
        )

        payload = response.json()['data']['changeRequestStatus']
        self.assertFalse(payload['success'])
        self.assertIn('permission', payload['errors'])
