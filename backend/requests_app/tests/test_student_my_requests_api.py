from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from requests_app.models import BoothRequest, CleaningRequest, ItemRequest, MaintenanceRequest, RequestBase
from requests_app.tests.test_rest_api import RequestsAPITestBase


class StudentMyRequestsAPITests(RequestsAPITestBase):
    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_student_can_list_all_own_requests(self):
        MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی لوله',
            location='بلوک الف',
            category='facilities',
        )
        CleaningRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.CLEANING,
            description='نظافت اتاق',
            location='بلوک ب',
            preferred_date='2026-06-20',
        )
        CleaningRequest.objects.create(
            user=self.other_student,
            request_type=RequestBase.RequestType.CLEANING,
            description='درخواست دیگران',
            location='بلوک ج',
            preferred_date='2026-06-21',
        )

        self.auth_as(self.student)
        response = self.client.get(reverse('requests:my-requests'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['count'], 2)
        self.assertEqual(len(response.data['data']['results']), 2)

    def test_student_can_filter_by_request_type(self):
        MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی',
            location='بلوک الف',
            category='facilities',
        )
        CleaningRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.CLEANING,
            description='نظافت',
            location='بلوک ب',
            preferred_date='2026-06-20',
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse('requests:my-requests'),
            {'request_type': RequestBase.RequestType.MAINTENANCE},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['count'], 1)
        self.assertEqual(
            response.data['data']['results'][0]['request_type'],
            RequestBase.RequestType.MAINTENANCE,
        )

    def test_invalid_request_type_filter_returns_400(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('requests:my-requests'),
            {'request_type': 'invalid'},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_student_can_retrieve_own_request_detail(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse('requests:student-request-detail', kwargs={'pk': request_obj.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['id'], request_obj.pk)
        self.assertEqual(response.data['data']['location'], 'بلوک الف')
        self.assertIn('status_timeline', response.data['data'])

    def test_student_cannot_retrieve_other_student_request_detail(self):
        other_request = MaintenanceRequest.objects.create(
            user=self.other_student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='درخواست خصوصی',
            location='بلوک ج',
            category='facilities',
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse('requests:student-request-detail', kwargs={'pk': other_request.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_item_request_detail_includes_item_fields(self):
        request_obj = ItemRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.ITEM,
            description='درخواست بالش',
            item=self.inventory_item,
            quantity=1,
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse('requests:student-request-detail', kwargs={'pk': request_obj.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['request_type'], RequestBase.RequestType.ITEM)
        self.assertEqual(response.data['data']['quantity'], 1)

    def test_booth_request_detail_includes_booth_fields(self):
        request_obj = BoothRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.BOOTH,
            description='غرفه کتاب',
            name='کتابخانه کوچک',
            category='کتاب',
            event_date='2026-07-01',
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse('requests:student-request-detail', kwargs={'pk': request_obj.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['name'], 'کتابخانه کوچک')
