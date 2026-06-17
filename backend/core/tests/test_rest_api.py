from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Notification
from users.models import Role, User


class NotificationsAPITestBase(APITestCase):
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

        self.other_student = User.objects.create(
            personnel_code='401234568',
            national_code='1234567891',
            first_name='مریم',
            last_name='احمدی',
            role=self.student_role,
        )
        self.other_student.set_password('other-pass')
        self.other_student.save()

        self.unread_notification = Notification.objects.create(
            user=self.student,
            message='اعلان خوانده‌نشده',
            is_read=False,
        )
        self.read_notification = Notification.objects.create(
            user=self.student,
            message='اعلان خوانده‌شده',
            is_read=True,
        )
        self.other_notification = Notification.objects.create(
            user=self.other_student,
            message='اعلان کاربر دیگر',
            is_read=False,
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class NotificationListAPITests(NotificationsAPITestBase):
    def test_student_lists_only_own_notifications(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('notifications:notification-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        ids = [item['id'] for item in response.data['data']['results']]
        self.assertIn(self.unread_notification.id, ids)
        self.assertIn(self.read_notification.id, ids)
        self.assertNotIn(self.other_notification.id, ids)

    def test_unread_notifications_appear_first(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('notifications:notification-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['data']['results']
        self.assertGreaterEqual(len(results), 2)
        self.assertFalse(results[0]['is_read'])

    def test_response_includes_unread_count(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('notifications:notification-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('unread_count', response.data['data'])
        self.assertEqual(response.data['data']['unread_count'], 1)

    def test_response_contains_required_fields(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('notifications:notification-list'))

        result = response.data['data']['results'][0]
        for field in ('id', 'message', 'is_read', 'created_at', 'related_request_id'):
            self.assertIn(field, result)

    def test_unauthenticated_cannot_list_notifications(self):
        response = self.client.get(reverse('notifications:notification-list'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])


class NotificationMarkReadAPITests(NotificationsAPITestBase):
    def test_student_marks_own_notification_as_read(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse(
                'notifications:notification-mark-read',
                kwargs={'pk': self.unread_notification.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['data']['is_read'])

        self.unread_notification.refresh_from_db()
        self.assertTrue(self.unread_notification.is_read)

    def test_marking_already_read_notification_is_idempotent(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse(
                'notifications:notification-mark-read',
                kwargs={'pk': self.read_notification.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['data']['is_read'])

    def test_student_cannot_mark_other_users_notification(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse(
                'notifications:notification-mark-read',
                kwargs={'pk': self.other_notification.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])

    def test_nonexistent_notification_returns_404(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('notifications:notification-mark-read', kwargs={'pk': 99999}),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_cannot_mark_read(self):
        response = self.client.post(
            reverse(
                'notifications:notification-mark-read',
                kwargs={'pk': self.unread_notification.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class NotificationMarkAllReadAPITests(NotificationsAPITestBase):
    def test_marks_all_unread_notifications_as_read(self):
        Notification.objects.create(
            user=self.student,
            message='اعلان اضافی خوانده‌نشده',
            is_read=False,
        )

        self.auth_as(self.student)
        response = self.client.post(reverse('notifications:notification-mark-all-read'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['updated_count'], 2)

        unread_remaining = Notification.objects.filter(
            user=self.student,
            is_read=False,
        ).count()
        self.assertEqual(unread_remaining, 0)

    def test_does_not_affect_other_users_notifications(self):
        self.auth_as(self.student)
        self.client.post(reverse('notifications:notification-mark-all-read'))

        self.other_notification.refresh_from_db()
        self.assertFalse(self.other_notification.is_read)

    def test_mark_all_read_with_no_unread_returns_zero(self):
        Notification.objects.filter(user=self.student, is_read=False).update(is_read=True)

        self.auth_as(self.student)
        response = self.client.post(reverse('notifications:notification-mark-all-read'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['updated_count'], 0)

    def test_unauthenticated_cannot_mark_all_read(self):
        response = self.client.post(reverse('notifications:notification-mark-all-read'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
