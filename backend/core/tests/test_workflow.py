from django.test import TestCase

from core.exceptions import NotificationServiceError
from core.models import Notification
from core.selectors.notification_selectors import NotificationSelector
from core.services.notification_service import NotificationService
from users.models import Role, User


class NotificationServiceWorkflowTests(TestCase):
    def setUp(self):
        self.student_role = Role.objects.create(name=Role.Name.STUDENT, description='دانشجو')

        self.student = User.objects.create(
            personnel_code='401234567',
            national_code='1234567890',
            first_name='علی',
            last_name='رضایی',
            role=self.student_role,
        )

        self.other_student = User.objects.create(
            personnel_code='401234568',
            national_code='1234567891',
            first_name='مریم',
            last_name='احمدی',
            role=self.student_role,
        )

        self.n1 = Notification.objects.create(
            user=self.student,
            message='اعلان اول',
            is_read=False,
        )
        self.n2 = Notification.objects.create(
            user=self.student,
            message='اعلان دوم',
            is_read=False,
        )
        self.n3 = Notification.objects.create(
            user=self.student,
            message='اعلان خوانده‌شده',
            is_read=True,
        )

    def test_mark_read_changes_is_read_to_true(self):
        NotificationService.mark_read(user=self.student, notification_id=self.n1.pk)

        self.n1.refresh_from_db()
        self.assertTrue(self.n1.is_read)

    def test_mark_read_is_idempotent(self):
        NotificationService.mark_read(user=self.student, notification_id=self.n3.pk)
        NotificationService.mark_read(user=self.student, notification_id=self.n3.pk)

        self.n3.refresh_from_db()
        self.assertTrue(self.n3.is_read)

    def test_mark_read_raises_error_for_wrong_user(self):
        with self.assertRaises(NotificationServiceError) as ctx:
            NotificationService.mark_read(
                user=self.other_student,
                notification_id=self.n1.pk,
            )

        self.assertEqual(ctx.exception.status_code, 404)

    def test_mark_all_read_updates_only_unread(self):
        updated = NotificationService.mark_all_read(user=self.student)

        self.assertEqual(updated, 2)
        self.assertEqual(
            Notification.objects.filter(user=self.student, is_read=False).count(),
            0,
        )

    def test_mark_all_read_does_not_touch_other_users(self):
        other_notification = Notification.objects.create(
            user=self.other_student,
            message='اعلان دیگری',
            is_read=False,
        )

        NotificationService.mark_all_read(user=self.student)

        other_notification.refresh_from_db()
        self.assertFalse(other_notification.is_read)

    def test_mark_all_read_returns_zero_when_nothing_unread(self):
        Notification.objects.filter(user=self.student).update(is_read=True)

        updated = NotificationService.mark_all_read(user=self.student)
        self.assertEqual(updated, 0)

    def test_selector_unread_count_is_accurate(self):
        count = NotificationSelector.get_unread_count(self.student)
        self.assertEqual(count, 2)

        NotificationService.mark_read(user=self.student, notification_id=self.n1.pk)
        count = NotificationSelector.get_unread_count(self.student)
        self.assertEqual(count, 1)

    def test_selector_returns_unread_first(self):
        queryset = list(NotificationSelector.get_for_user(self.student))
        unread_positions = [i for i, n in enumerate(queryset) if not n.is_read]
        read_positions = [i for i, n in enumerate(queryset) if n.is_read]

        if unread_positions and read_positions:
            self.assertLess(max(unread_positions), min(read_positions))

    def test_get_by_id_raises_404_for_missing(self):
        with self.assertRaises(NotificationServiceError) as ctx:
            NotificationSelector.get_by_id_for_user(self.student, 99999)

        self.assertEqual(ctx.exception.status_code, 404)
