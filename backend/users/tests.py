from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from dorms.models import Block, Room, RoomAssignment
from users.models import Role, User


class AuthAPITests(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(
            name=Role.Name.STUDENT,
            description='دانشجوی ساکن خوابگاه',
        )
        self.user = User.objects.create(
            personnel_code='401234567',
            national_code='3456789012',
            first_name='علی',
            last_name='رضایی',
            role=self.role,
        )
        self.user.set_password('secure-pass-123')
        self.user.save()

    def test_login_returns_jwt_tokens_and_profile(self):
        response = self.client.post(
            reverse('users:login'),
            {
                'personnel_code': self.user.personnel_code,
                'password': 'secure-pass-123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], 'ورود با موفقیت انجام شد.')
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])
        self.assertEqual(response.data['data']['user']['role_name'], Role.Name.STUDENT)
        self.assertNotIn('national_code', response.data['data']['user'])

    def test_login_rejects_invalid_credentials_with_persian_error(self):
        response = self.client.post(
            reverse('users:login'),
            {
                'personnel_code': self.user.personnel_code,
                'password': 'wrong-password',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['message'], 'کد پرسنلی یا رمز عبور نادرست است.')
        self.assertIn('credentials', response.data['errors'])

    def test_profile_returns_authenticated_user(self):
        block = Block.objects.create(name='الف', total_floors=3, room_numbers=['101'])
        room = Room.objects.create(block=block, room_number='101', floor=1, capacity=4)
        self.user.block = block
        self.user.save(update_fields=['block'])
        RoomAssignment.objects.create(
            user=self.user,
            room=room,
            assigned_from=date.today(),
            is_current=True,
        )

        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        response = self.client.get(reverse('users:profile'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['personnel_code'], self.user.personnel_code)
        self.assertEqual(response.data['data']['role_name'], Role.Name.STUDENT)
        self.assertEqual(response.data['data']['block_name'], 'الف')
        self.assertEqual(response.data['data']['room_number'], '101')

    def test_profile_requires_authentication_with_response_envelope(self):
        response = self.client.get(reverse('users:profile'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['message'], 'اطلاعات احراز هویت نامعتبر است.')
        self.assertIn('authentication', response.data['errors'])

    def test_refresh_rotates_tokens(self):
        refresh = RefreshToken.for_user(self.user)

        response = self.client.post(
            reverse('users:token-refresh'),
            {'refresh': str(refresh)},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])

    def test_logout_blacklists_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        logout_response = self.client.post(
            reverse('users:logout'),
            {'refresh': str(refresh)},
            format='json',
        )

        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertTrue(logout_response.data['success'])

        refresh_response = self.client.post(
            reverse('users:token-refresh'),
            {'refresh': str(refresh)},
            format='json',
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(refresh_response.data['success'])
