from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from dorms.models import Block, Room
from users.models import Role, User


class DormsAPITestBase(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(
            name=Role.Name.STUDENT,
            description='دانشجو',
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

        self.block = Block.objects.create(
            name='بلوک الف',
            total_floors=4,
            room_numbers=['101', '102', '201'],
        )
        Room.objects.create(
            block=self.block,
            room_number='101',
            floor=1,
            capacity=4,
        )
        Room.objects.create(
            block=self.block,
            room_number='201',
            floor=2,
            capacity=4,
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class BlockRESTAPITests(DormsAPITestBase):
    def test_block_list_requires_authentication(self):
        response = self.client.get(reverse('dorms:block-list'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_block_list_returns_blocks(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('dorms:block-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']['results']), 1)
        self.assertEqual(response.data['data']['results'][0]['name'], 'بلوک الف')

    def test_block_floors_returns_distinct_floors(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('dorms:block-floors', kwargs={'pk': self.block.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']['results']), 2)
        self.assertEqual(response.data['data']['results'][0]['label'], 'طبقه 1')
        self.assertEqual(response.data['data']['results'][1]['label'], 'طبقه 2')

    def test_block_floors_returns_404_for_missing_block(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('dorms:block-floors', kwargs={'pk': 9999}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
