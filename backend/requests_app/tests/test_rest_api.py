from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from requests_app.models import InventoryItem, MaintenanceRequest, RequestBase
from users.models import Role, User


class RequestsAPITestBase(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(
            name=Role.Name.STUDENT,
            description='دانشجو',
        )
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

        self.other_student = User.objects.create(
            personnel_code='401234568',
            national_code='1234567891',
            first_name='مریم',
            last_name='احمدی',
            role=self.student_role,
        )
        self.other_student.set_password('student-pass')
        self.other_student.save()

        self.supervisor = User.objects.create(
            personnel_code='9001001',
            national_code='2234567890',
            first_name='حسین',
            last_name='کریمی',
            role=self.supervisor_role,
        )
        self.supervisor.set_password('supervisor-pass')
        self.supervisor.save()

        self.inventory_item = InventoryItem.objects.create(
            item_name='بالش',
            category='لوازم خواب',
            quantity=10,
            description='بالش استاندارد خوابگاه',
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class MaintenanceRESTAPITests(RequestsAPITestBase):
    def test_student_can_create_maintenance_request(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('requests:maintenance-request-list'),
            {
                'description': 'نشتی شیر آب در آشپزخانه',
                'location': 'بلوک الف - طبقه ۲',
                'extra_description': 'از دیشب آب جمع می‌شود.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], 'درخواست تعمیرات با موفقیت ثبت شد.')
        self.assertEqual(response.data['data']['status'], RequestBase.Status.PENDING)
        self.assertEqual(response.data['data']['user']['personnel_code'], self.student.personnel_code)

    def test_student_list_only_own_requests(self):
        MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی خود دانشجو',
            location='اتاق ۱۰۱',
        )
        MaintenanceRequest.objects.create(
            user=self.other_student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='خرابی دانشجوی دیگر',
            location='اتاق ۲۰۲',
        )

        self.auth_as(self.student)
        response = self.client.get(reverse('requests:maintenance-request-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['count'], 1)
        self.assertEqual(len(response.data['data']['results']), 1)
        self.assertEqual(
            response.data['data']['results'][0]['description'],
            'خرابی خود دانشجو',
        )

    def test_student_cannot_retrieve_other_student_request(self):
        other_request = MaintenanceRequest.objects.create(
            user=self.other_student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='درخواست خصوصی',
            location='اتاق ۲۰۲',
        )

        self.auth_as(self.student)
        response = self.client.get(
            reverse(
                'requests:maintenance-request-detail',
                kwargs={'pk': other_request.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_supervisor_can_list_all_maintenance_requests(self):
        MaintenanceRequest.objects.create(
            user=self.student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='درخواست اول',
            location='اتاق ۱۰۱',
        )
        MaintenanceRequest.objects.create(
            user=self.other_student,
            request_type=RequestBase.RequestType.MAINTENANCE,
            description='درخواست دوم',
            location='اتاق ۲۰۲',
        )

        self.auth_as(self.supervisor)
        response = self.client.get(reverse('requests:maintenance-request-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['count'], 2)

    def test_supervisor_cannot_create_maintenance_request(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('requests:maintenance-request-list'),
            {
                'description': 'درخواست سرپرست',
                'location': 'بلوک ب',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])


class ItemRESTAPITests(RequestsAPITestBase):
    def test_item_request_rejects_quantity_above_inventory(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('requests:item-request-list'),
            {
                'description': 'درخواست بالش اضافه',
                'item': self.inventory_item.pk,
                'quantity': 50,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('quantity', response.data['errors'])

    def test_inventory_items_list_is_available_to_student(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('requests:inventory-items'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(len(response.data['data']['results']), 1)


class CleaningRESTAPITests(RequestsAPITestBase):
    def test_student_can_create_cleaning_request(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('requests:cleaning-request-list'),
            {
                'description': 'نظافت سرویس بهداشتی',
                'location': 'بلوک الف - طبقه ۱',
                'preferred_date': (date.today() + timedelta(days=2)).isoformat(),
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])


class BoothRESTAPITests(RequestsAPITestBase):
    def test_student_can_create_booth_request(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('requests:booth-request-list'),
            {
                'description': 'غرفه فروش دست‌ساز',
                'name': 'غرفه هنری',
                'category': 'صنایع دستی',
                'event_date': (date.today() + timedelta(days=10)).isoformat(),
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
