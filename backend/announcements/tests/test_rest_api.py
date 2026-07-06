from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from announcements.models import Announcement
from core.models import Notification
from users.models import Role, User


class AnnouncementsAPITestBase(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(name=Role.Name.STUDENT, description='دانشجو')
        self.supervisor_role = Role.objects.create(
            name=Role.Name.SUPERVISOR,
            description='سرپرست',
        )
        self.admin_role = Role.objects.create(name=Role.Name.ADMIN, description='مدیر')

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

        self.admin = User.objects.create(
            personnel_code='9002001',
            national_code='3234567890',
            first_name='مدیر',
            last_name='سیستم',
            role=self.admin_role,
        )
        self.admin.set_password('admin-pass')
        self.admin.save()

        self.announcement = Announcement.objects.create(
            title='اطلاعیه تست',
            content='محتوای اطلاعیه تست',
            created_by=self.supervisor,
            is_active=True,
        )
        self.inactive_announcement = Announcement.objects.create(
            title='اطلاعیه غیرفعال',
            content='محتوای غیرفعال',
            created_by=self.supervisor,
            is_active=False,
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class AnnouncementListAPITests(AnnouncementsAPITestBase):
    def test_student_lists_active_announcements_only(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('announcements:announcement-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        ids = [item['id'] for item in response.data['data']['results']]
        self.assertIn(self.announcement.id, ids)
        self.assertNotIn(self.inactive_announcement.id, ids)

    def test_supervisor_lists_active_announcements(self):
        self.auth_as(self.supervisor)
        response = self.client.get(reverse('announcements:announcement-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_unauthenticated_cannot_list(self):
        response = self.client.get(reverse('announcements:announcement-list'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_list_response_contains_required_fields(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('announcements:announcement-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data['data']['results'][0]
        for field in ('id', 'title', 'content', 'is_active', 'created_at', 'created_by'):
            self.assertIn(field, result)

    def test_list_response_includes_created_by_display_name_and_avatar(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('announcements:announcement-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        created_by = response.data['data']['results'][0]['created_by']
        self.assertEqual(created_by['display_name'], 'حسین کریمی')
        self.assertIsNone(created_by['avatar'])
        for field in ('id', 'personnel_code', 'first_name', 'last_name'):
            self.assertIn(field, created_by)


class AnnouncementCreateAPITests(AnnouncementsAPITestBase):
    def test_supervisor_creates_announcement(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'اطلاعیه جدید', 'content': 'متن اطلاعیه جدید'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['title'], 'اطلاعیه جدید')
        self.assertTrue(
            Announcement.objects.filter(title='اطلاعیه جدید').exists(),
        )

    def test_student_cannot_create_announcement(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'تست', 'content': 'محتوا'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_create_with_missing_title_fails(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'content': 'فقط محتوا بدون عنوان'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('title', response.data['errors'])

    def test_create_with_missing_content_fails(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'فقط عنوان'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('content', response.data['errors'])

    def test_unauthenticated_cannot_create(self):
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'تست', 'content': 'محتوا'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_with_whitespace_only_title_fails(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': '   ', 'content': 'محتوای معتبر'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('title', response.data['errors'])

    def test_create_with_whitespace_only_content_fails(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'عنوان معتبر', 'content': '   '},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('content', response.data['errors'])

    def test_create_with_title_exceeding_max_length_fails(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'ا' * 201, 'content': 'محتوا'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('title', response.data['errors'])

    def test_create_strips_whitespace_from_fields(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': '  عنوان با فاصله  ', 'content': '  محتوا با فاصله  '},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['title'], 'عنوان با فاصله')
        self.assertEqual(response.data['data']['content'], 'محتوا با فاصله')

    def test_create_notifies_active_students(self):
        self.auth_as(self.supervisor)
        initial_count = Notification.objects.filter(user=self.student).count()

        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'اطلاعیه با اعلان', 'content': 'متن'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Notification.objects.filter(user=self.student).count(),
            initial_count + 1,
        )
        latest = Notification.objects.filter(user=self.student).order_by('-id').first()
        self.assertIn('اطلاعیه با اعلان', latest.message)

    def test_admin_creates_announcement(self):
        self.auth_as(self.admin)
        response = self.client.post(
            reverse('announcements:announcement-list'),
            {'title': 'اطلاعیه مدیر', 'content': 'متن مدیر'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])


class AnnouncementDetailAPITests(AnnouncementsAPITestBase):
    def test_student_retrieves_active_announcement(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['id'], self.announcement.id)

    def test_student_cannot_see_inactive_announcement(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse(
                'announcements:announcement-detail',
                kwargs={'pk': self.inactive_announcement.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])

    def test_supervisor_can_see_inactive_announcement(self):
        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse(
                'announcements:announcement-detail',
                kwargs={'pk': self.inactive_announcement.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_nonexistent_announcement_returns_404(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('announcements:announcement-detail', kwargs={'pk': 99999}),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_detail_includes_created_by_display_name(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        created_by = response.data['data']['created_by']
        self.assertEqual(created_by['display_name'], 'حسین کریمی')
        self.assertIsNone(created_by['avatar'])


class AnnouncementUpdateAPITests(AnnouncementsAPITestBase):
    def test_supervisor_updates_announcement(self):
        self.auth_as(self.supervisor)
        response = self.client.put(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
            {'title': 'عنوان به‌روز شده', 'content': 'محتوای به‌روز شده'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['title'], 'عنوان به‌روز شده')

        self.announcement.refresh_from_db()
        self.assertEqual(self.announcement.title, 'عنوان به‌روز شده')

    def test_supervisor_partial_update_only_title(self):
        original_content = self.announcement.content
        self.auth_as(self.supervisor)
        response = self.client.put(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
            {'title': 'فقط عنوان تغییر کرده'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.announcement.refresh_from_db()
        self.assertEqual(self.announcement.title, 'فقط عنوان تغییر کرده')
        self.assertEqual(self.announcement.content, original_content)

    def test_student_cannot_update_announcement(self):
        self.auth_as(self.student)
        response = self.client.put(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
            {'title': 'تلاش دانشجو'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_patch_updates_announcement(self):
        self.auth_as(self.supervisor)
        response = self.client.patch(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
            {'content': 'محتوای patch شده'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.announcement.refresh_from_db()
        self.assertEqual(self.announcement.content, 'محتوای patch شده')

    def test_update_with_empty_body_fails(self):
        self.auth_as(self.supervisor)
        response = self.client.put(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
            {},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_admin_updates_announcement(self):
        self.auth_as(self.admin)
        response = self.client.put(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
            {'title': 'ویرایش توسط مدیر'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['title'], 'ویرایش توسط مدیر')


class AnnouncementDeactivateAPITests(AnnouncementsAPITestBase):
    def test_supervisor_deactivates_announcement(self):
        self.auth_as(self.supervisor)
        response = self.client.delete(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertFalse(response.data['data']['is_active'])

        self.announcement.refresh_from_db()
        self.assertFalse(self.announcement.is_active)

    def test_deactivating_already_inactive_fails(self):
        self.auth_as(self.supervisor)
        response = self.client.delete(
            reverse(
                'announcements:announcement-detail',
                kwargs={'pk': self.inactive_announcement.pk},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('قبلاً', response.data['message'])

    def test_student_cannot_deactivate_announcement(self):
        self.auth_as(self.student)
        response = self.client.delete(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_admin_deactivates_announcement(self):
        self.auth_as(self.admin)
        response = self.client.delete(
            reverse('announcements:announcement-detail', kwargs={'pk': self.announcement.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['data']['is_active'])
