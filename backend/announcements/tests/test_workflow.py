from django.test import TestCase

from announcements.exceptions import AnnouncementServiceError
from announcements.models import Announcement
from announcements.services.announcement_service import AnnouncementService
from core.models import Notification
from users.models import Role, User


class AnnouncementWorkflowTests(TestCase):
    def setUp(self):
        self.student_role = Role.objects.create(name=Role.Name.STUDENT, description='دانشجو')
        self.supervisor_role = Role.objects.create(
            name=Role.Name.SUPERVISOR,
            description='سرپرست',
        )

        self.supervisor = User.objects.create(
            personnel_code='9001001',
            national_code='2234567890',
            first_name='حسین',
            last_name='کریمی',
            role=self.supervisor_role,
        )

        self.students = []
        for i in range(3):
            student = User.objects.create(
                personnel_code=f'40123456{i}',
                national_code=f'123456789{i}',
                first_name='دانشجو',
                last_name=str(i),
                role=self.student_role,
                is_active=True,
            )
            self.students.append(student)

        self.inactive_student = User.objects.create(
            personnel_code='4099999',
            national_code='9999999999',
            first_name='غیرفعال',
            last_name='دانشجو',
            role=self.student_role,
            is_active=False,
        )

    def test_creating_announcement_broadcasts_to_all_active_students(self):
        announcement = AnnouncementService.create(
            user=self.supervisor,
            data={'title': 'اطلاعیه مهم', 'content': 'متن اطلاعیه'},
        )

        notifications = Notification.objects.filter(
            message__icontains='اطلاعیه مهم',
        )
        self.assertEqual(notifications.count(), len(self.students))

        notified_user_ids = set(notifications.values_list('user_id', flat=True))
        for student in self.students:
            self.assertIn(student.id, notified_user_ids)

        self.assertNotIn(self.inactive_student.id, notified_user_ids)

    def test_creating_announcement_does_not_notify_inactive_users(self):
        AnnouncementService.create(
            user=self.supervisor,
            data={'title': 'اطلاعیه دیگر', 'content': 'متن'},
        )

        self.assertFalse(
            Notification.objects.filter(user=self.inactive_student).exists(),
        )

    def test_student_cannot_create_announcement(self):
        with self.assertRaises(AnnouncementServiceError) as ctx:
            AnnouncementService.create(
                user=self.students[0],
                data={'title': 'تست', 'content': 'متن'},
            )

        self.assertIn('سرپرست', ctx.exception.message)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_deactivating_announcement_sets_is_active_false(self):
        announcement = AnnouncementService.create(
            user=self.supervisor,
            data={'title': 'اطلاعیه موقت', 'content': 'حذف می‌شود'},
        )

        deactivated = AnnouncementService.deactivate(
            user=self.supervisor,
            announcement_id=announcement.id,
        )

        self.assertFalse(deactivated.is_active)
        announcement_db = Announcement.objects.get(pk=announcement.id)
        self.assertFalse(announcement_db.is_active)

    def test_deactivating_already_inactive_raises_error(self):
        announcement = Announcement.objects.create(
            title='غیرفعال',
            content='متن',
            created_by=self.supervisor,
            is_active=False,
        )

        with self.assertRaises(AnnouncementServiceError) as ctx:
            AnnouncementService.deactivate(
                user=self.supervisor,
                announcement_id=announcement.id,
            )

        self.assertIn('غیرفعال', ctx.exception.message)

    def test_updating_announcement_persists_changes(self):
        announcement = AnnouncementService.create(
            user=self.supervisor,
            data={'title': 'قدیمی', 'content': 'متن قدیمی'},
        )

        updated = AnnouncementService.update(
            user=self.supervisor,
            announcement_id=announcement.id,
            data={'title': 'جدید', 'content': 'متن جدید'},
        )

        self.assertEqual(updated.title, 'جدید')
        self.assertEqual(updated.content, 'متن جدید')

    def test_notification_message_contains_announcement_title(self):
        AnnouncementService.create(
            user=self.supervisor,
            data={'title': 'عنوان ویژه', 'content': 'متن'},
        )

        notification = Notification.objects.filter(user=self.students[0]).first()
        self.assertIsNotNone(notification)
        self.assertIn('عنوان ویژه', notification.message)
        self.assertFalse(notification.is_read)

    def test_create_strips_whitespace_from_fields(self):
        announcement = AnnouncementService.create(
            user=self.supervisor,
            data={'title': '  عنوان  ', 'content': '  محتوا  '},
        )

        self.assertEqual(announcement.title, 'عنوان')
        self.assertEqual(announcement.content, 'محتوا')

    def test_update_strips_whitespace_from_fields(self):
        announcement = AnnouncementService.create(
            user=self.supervisor,
            data={'title': 'قدیمی', 'content': 'متن قدیمی'},
        )

        updated = AnnouncementService.update(
            user=self.supervisor,
            announcement_id=announcement.id,
            data={'title': '  جدید  ', 'content': '  متن جدید  '},
        )

        self.assertEqual(updated.title, 'جدید')
        self.assertEqual(updated.content, 'متن جدید')

    def test_empty_update_raises_error(self):
        announcement = AnnouncementService.create(
            user=self.supervisor,
            data={'title': 'تست', 'content': 'متن'},
        )

        with self.assertRaises(AnnouncementServiceError) as ctx:
            AnnouncementService.update(
                user=self.supervisor,
                announcement_id=announcement.id,
                data={},
            )

        self.assertIn('حداقل', ctx.exception.message)
