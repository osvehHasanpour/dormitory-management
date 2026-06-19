from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from requests_app.models import MaintenanceRequest, RequestBase, RequestStatusHistory
from requests_app.tests.test_rest_api import RequestsAPITestBase


class SupervisorRequestAPITests(RequestsAPITestBase):
    def test_supervisor_can_change_status_via_rest(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse(
                'requests:maintenance-request-change-status',
                kwargs={'pk': request_obj.pk},
            ),
            {
                'status': RequestBase.Status.IN_PROGRESS,
                'comment': 'در حال بررسی',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(
            response.data['message'],
            'وضعیت درخواست با موفقیت به‌روزرسانی شد.',
        )
        self.assertEqual(response.data['data']['status'], RequestBase.Status.IN_PROGRESS)
        self.assertEqual(
            response.data['data']['handled_by']['personnel_code'],
            self.supervisor.personnel_code,
        )

        request_obj.refresh_from_db()
        self.assertEqual(request_obj.status, RequestBase.Status.IN_PROGRESS)
        self.assertEqual(request_obj.handled_by_id, self.supervisor.id)

        history = RequestStatusHistory.objects.filter(request_id=request_obj.pk)
        self.assertEqual(history.count(), 1)
        last_entry = history.order_by('-created_at').first()
        self.assertEqual(last_entry.previous_status, RequestBase.Status.PENDING)
        self.assertEqual(last_entry.new_status, RequestBase.Status.IN_PROGRESS)
        self.assertEqual(last_entry.acting_supervisor_id, self.supervisor.id)
        self.assertEqual(last_entry.comment, 'در حال بررسی')

    def test_reject_without_reason_returns_400(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse(
                'requests:maintenance-request-change-status',
                kwargs={'pk': request_obj.pk},
            ),
            {'status': RequestBase.Status.REJECTED},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('rejection_reason', response.data['errors'])

        request_obj.refresh_from_db()
        self.assertEqual(request_obj.status, RequestBase.Status.PENDING)

    def test_student_cannot_change_status_via_rest(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )

        self.auth_as(self.student)
        response = self.client.patch(
            reverse(
                'requests:maintenance-request-change-status',
                kwargs={'pk': request_obj.pk},
            ),
            {'status': RequestBase.Status.IN_PROGRESS},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])
        self.assertIn('permission', response.data['errors'])

        request_obj.refresh_from_db()
        self.assertEqual(request_obj.status, RequestBase.Status.PENDING)

    def test_reject_with_reason_persists_reason_and_history(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse(
                'requests:maintenance-request-change-status',
                kwargs={'pk': request_obj.pk},
            ),
            {
                'status': RequestBase.Status.REJECTED,
                'rejection_reason': 'درخواست تکراری است.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(
            response.data['data']['rejection_reason'],
            'درخواست تکراری است.',
        )

        request_obj.refresh_from_db()
        self.assertEqual(request_obj.rejection_reason, 'درخواست تکراری است.')

        history = RequestStatusHistory.objects.get(
            request_id=request_obj.pk,
            new_status=RequestBase.Status.REJECTED,
        )
        self.assertEqual(history.rejection_reason, 'درخواست تکراری است.')

    def test_student_can_view_own_request_timeline(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )
        RequestStatusHistory.objects.create(
            request=request_obj,
            previous_status=None,
            new_status=RequestBase.Status.PENDING,
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse(
                'requests:maintenance-request-timeline',
                kwargs={'pk': request_obj.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']['results']), 1)
        self.assertEqual(
            response.data['data']['results'][0]['new_status'],
            RequestBase.Status.PENDING,
        )

    def test_supervisor_can_assign_staff_on_status_change(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse(
                'requests:maintenance-request-change-status',
                kwargs={'pk': request_obj.pk},
            ),
            {
                'status': RequestBase.Status.IN_PROGRESS,
                'assigned_staff': self.supervisor.pk,
                'comment': 'محول به سرپرست',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['data']['assigned_staff']['personnel_code'],
            self.supervisor.personnel_code,
        )

        request_obj.refresh_from_db()
        self.assertEqual(request_obj.assigned_staff_id, self.supervisor.id)

    def test_invalid_transition_returns_400(self):
        request_obj = MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='نشتی آب',
            location='بلوک الف',
            category='facilities',
        )

        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse(
                'requests:maintenance-request-change-status',
                kwargs={'pk': request_obj.pk},
            ),
            {'status': RequestBase.Status.COMPLETED},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('مجاز نیست', response.data['message'])

    def test_create_maintenance_records_initial_history(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('requests:maintenance-request-list'),
            {
                'description': 'خرابی لوله',
                'location': 'بلوک الف',
                'category': 'facilities',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data['data']['id']
        history = RequestStatusHistory.objects.filter(request_id=request_id)
        self.assertEqual(history.count(), 1)
        self.assertIsNone(history.first().previous_status)
        self.assertEqual(history.first().new_status, RequestBase.Status.PENDING)

    def test_cleaning_active_limit_blocks_fourth_request(self):
        self.auth_as(self.student)
        for index in range(3):
            response = self.client.post(
                reverse('requests:cleaning-request-list'),
                {
                    'description': f'نظافت {index + 1}',
                    'location': f'بلوک {index + 1}',
                    'preferred_date': (date.today() + timedelta(days=index + 1)).isoformat(),
                },
                format='json',
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post(
            reverse('requests:cleaning-request-list'),
            {
                'description': 'نظافت چهارم',
                'location': 'بلوک ۴',
                'preferred_date': (date.today() + timedelta(days=10)).isoformat(),
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('limit', response.data['errors'])

    def test_item_quantity_above_three_rejected(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('requests:item-request-list'),
            {
                'description': 'درخواست بالش',
                'item': self.inventory_item.pk,
                'quantity': 4,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('quantity', response.data['errors'])
