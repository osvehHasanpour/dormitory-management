from datetime import time, timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from classes.models import Class, ClassRegistration, Rating
from users.models import Role, User


class SupervisorClassTestBase(APITestCase):
    def setUp(self):
        self.student_role = Role.objects.create(
            name=Role.Name.STUDENT,
            description='دانشجو',
        )
        self.supervisor_role = Role.objects.create(
            name=Role.Name.SUPERVISOR,
            description='سرپرست',
        )
        self.admin_role = Role.objects.create(
            name=Role.Name.ADMIN,
            description='مدیر',
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

        self.admin = User.objects.create(
            personnel_code='801234567',
            national_code='3234567890',
            first_name='مدیر',
            last_name='سیستم',
            role=self.admin_role,
        )
        self.admin.set_password('admin-pass')
        self.admin.save()

        now = timezone.now()
        self.active_class = Class.objects.create(
            title='کلاس یوگا',
            description='آموزش یوگا',
            location='سالن ورزشی',
            capacity=2,
            start_datetime=now + timedelta(days=2),
            end_datetime=now + timedelta(days=2, hours=2),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.SPORTS,
            status=Class.Status.ACTIVE,
        )
        self.ended_class = Class.objects.create(
            title='کلاس خوشنویسی',
            description='آموزش خط',
            location='سالن هنر',
            capacity=10,
            start_datetime=now - timedelta(days=5),
            end_datetime=now - timedelta(days=5, hours=-2),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.ART,
            status=Class.Status.COMPLETED,
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def _create_payload(self, **overrides):
        now = timezone.now()
        payload = {
            'title': 'کلاس جدید',
            'description': 'توضیحات کلاس',
            'location': 'اتاق ۱۰۱',
            'category': Class.Category.EDUCATIONAL,
            'capacity': 15,
            'start_datetime': (now + timedelta(days=3)).isoformat(),
            'end_datetime': (now + timedelta(days=3, hours=2)).isoformat(),
            'day_of_week': Class.DayOfWeek.SATURDAY,
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'teacher_id': self.supervisor.pk,
        }
        payload.update(overrides)
        return payload


class SupervisorClassRBACTests(SupervisorClassTestBase):
    def test_student_cannot_create_class(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('supervisor_classes:class-list'),
            self._create_payload(),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_student_cannot_update_class(self):
        self.auth_as(self.student)
        response = self.client.put(
            reverse('supervisor_classes:class-detail', kwargs={'pk': self.active_class.pk}),
            {'title': 'عنوان جدید'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_cancel_class(self):
        self.auth_as(self.student)
        response = self.client.delete(
            reverse('supervisor_classes:class-detail', kwargs={'pk': self.active_class.pk}),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_view_supervisor_enrollments(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('supervisor_classes:class-enrollments', kwargs={'pk': self.active_class.pk}),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_manage_classes(self):
        self.auth_as(self.admin)
        response = self.client.post(
            reverse('supervisor_classes:class-list'),
            self._create_payload(),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SupervisorClassCRUDTests(SupervisorClassTestBase):
    def test_supervisor_can_create_class(self):
        self.auth_as(self.supervisor)
        response = self.client.post(
            reverse('supervisor_classes:class-list'),
            self._create_payload(title='کارگاه برنامه‌نویسی'),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        data = response.data['data']
        self.assertEqual(data['title'], 'کارگاه برنامه‌نویسی')
        self.assertEqual(data['status'], Class.Status.ACTIVE)
        self.assertEqual(data['location'], 'اتاق ۱۰۱')
        self.assertEqual(data['day_of_week'], Class.DayOfWeek.SATURDAY)
        self.assertEqual(data['day_of_week_display'], 'شنبه')
        self.assertEqual(data['start_time'], '10:00:00')
        self.assertEqual(data['end_time'], '12:00:00')
        self.assertEqual(data['created_by']['id'], self.supervisor.pk)
        self.assertEqual(data['teacher']['id'], self.supervisor.pk)
        self.assertTrue(
            Class.objects.filter(title='کارگاه برنامه‌نویسی', status=Class.Status.ACTIVE).exists(),
        )

    def test_create_rejects_past_start_datetime(self):
        self.auth_as(self.supervisor)
        now = timezone.now()
        response = self.client.post(
            reverse('supervisor_classes:class-list'),
            self._create_payload(
                start_datetime=(now - timedelta(days=1)).isoformat(),
                end_datetime=(now + timedelta(hours=2)).isoformat(),
            ),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('start_datetime', response.data['errors'])

    def test_supervisor_can_list_all_classes(self):
        self.auth_as(self.supervisor)
        response = self.client.get(reverse('supervisor_classes:class-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data['data']['results']]
        self.assertIn(self.active_class.id, ids)
        self.assertIn(self.ended_class.id, ids)

    def test_supervisor_can_filter_by_status(self):
        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_classes:class-list'),
            {'status': Class.Status.COMPLETED},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['data']['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.ended_class.id)

    def test_finished_filter_returns_non_active_classes(self):
        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_classes:class-list'),
            {'status': 'finished'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['data']['results']
        ids = [item['id'] for item in results]
        self.assertIn(self.ended_class.id, ids)
        self.assertNotIn(self.active_class.id, ids)
        self.assertTrue(
            all(item['status'] != Class.Status.ACTIVE for item in results),
        )

    def test_ended_active_class_is_marked_completed_on_list(self):
        now = timezone.now()
        expired_active = Class.objects.create(
            title='کلاس منقضی',
            description='کلاس گذشته',
            location='اتاق ۲۰۲',
            capacity=10,
            start_datetime=now - timedelta(days=2),
            end_datetime=now - timedelta(hours=1),
            day_of_week=Class.DayOfWeek.MONDAY,
            start_time=time(9, 0),
            end_time=time(11, 0),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.EDUCATIONAL,
            status=Class.Status.ACTIVE,
        )

        self.auth_as(self.supervisor)
        response = self.client.get(reverse('supervisor_classes:class-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expired_active.refresh_from_db()
        self.assertEqual(expired_active.status, Class.Status.COMPLETED)

    def test_active_filter_excludes_past_end_datetime(self):
        now = timezone.now()
        expired_active = Class.objects.create(
            title='کلاس منقضی',
            description='کلاس گذشته',
            location='اتاق ۲۰۲',
            capacity=10,
            start_datetime=now - timedelta(days=2),
            end_datetime=now - timedelta(hours=1),
            day_of_week=Class.DayOfWeek.MONDAY,
            start_time=time(9, 0),
            end_time=time(11, 0),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.EDUCATIONAL,
            status=Class.Status.ACTIVE,
        )

        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_classes:class-list'),
            {'status': Class.Status.ACTIVE},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data['data']['results']]
        self.assertIn(self.active_class.id, ids)
        self.assertNotIn(expired_active.id, ids)
        self.assertNotIn(self.ended_class.id, ids)

    def test_supervisor_can_get_class_detail(self):
        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_classes:class-detail', kwargs={'pk': self.active_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(data['title'], self.active_class.title)
        self.assertEqual(data['enrolled_count'], 0)
        self.assertIn('status_display', data)
        self.assertIn('ratings_count', data)

    def test_supervisor_can_update_class(self):
        self.auth_as(self.supervisor)
        response = self.client.put(
            reverse('supervisor_classes:class-detail', kwargs={'pk': self.active_class.pk}),
            {
                'title': 'کلاس یوگا پیشرفته',
                'capacity': 5,
                'location': 'سالن جدید',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(data['title'], 'کلاس یوگا پیشرفته')
        self.assertEqual(data['capacity'], 5)
        self.assertEqual(data['location'], 'سالن جدید')

        self.active_class.refresh_from_db()
        self.assertEqual(self.active_class.title, 'کلاس یوگا پیشرفته')

    def test_supervisor_cannot_reduce_capacity_below_enrollments(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.active_class,
        )
        ClassRegistration.objects.create(
            user=self.other_student,
            class_instance=self.active_class,
        )

        self.auth_as(self.supervisor)
        response = self.client.put(
            reverse('supervisor_classes:class-detail', kwargs={'pk': self.active_class.pk}),
            {'capacity': 1},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('capacity', response.data['errors'])

    def test_supervisor_can_cancel_class(self):
        self.auth_as(self.supervisor)
        response = self.client.delete(
            reverse('supervisor_classes:class-detail', kwargs={'pk': self.active_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['status'], Class.Status.CANCELLED)

        self.active_class.refresh_from_db()
        self.assertEqual(self.active_class.status, Class.Status.CANCELLED)

    def test_cancelled_class_cannot_be_updated(self):
        self.active_class.status = Class.Status.CANCELLED
        self.active_class.save(update_fields=['status'])

        self.auth_as(self.supervisor)
        response = self.client.put(
            reverse('supervisor_classes:class-detail', kwargs={'pk': self.active_class.pk}),
            {'title': 'عنوان جدید'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data['errors'])


class SupervisorClassOverviewTests(SupervisorClassTestBase):
    def test_supervisor_can_view_enrollments(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.active_class,
        )
        ClassRegistration.objects.create(
            user=self.other_student,
            class_instance=self.active_class,
        )

        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_classes:class-enrollments', kwargs={'pk': self.active_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(data['enrolled_count'], 2)
        self.assertEqual(len(data['results']), 2)
        student_ids = {item['student']['id'] for item in data['results']}
        self.assertEqual(student_ids, {self.student.pk, self.other_student.pk})

    def test_supervisor_can_view_ratings(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.ended_class,
        )
        Rating.objects.create(
            user=self.student,
            class_instance=self.ended_class,
            score=5,
            comment='کلاس عالی بود',
        )
        Rating.objects.create(
            user=self.other_student,
            class_instance=self.ended_class,
            score=3,
            comment='قابل قبول',
        )

        self.auth_as(self.supervisor)
        response = self.client.get(
            reverse('supervisor_classes:class-ratings', kwargs={'pk': self.ended_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(data['ratings_count'], 2)
        self.assertEqual(data['average_rating'], 4.0)
        self.assertEqual(len(data['results']), 2)
        comments = {item['comment'] for item in data['results']}
        self.assertIn('کلاس عالی بود', comments)


class SupervisorClassStudentInteractionTests(SupervisorClassTestBase):
    def test_cancelled_class_hidden_from_student_list(self):
        self.active_class.status = Class.Status.CANCELLED
        self.active_class.save(update_fields=['status'])

        self.auth_as(self.student)
        response = self.client.get(reverse('classes:class-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in response.data['data']['results']]
        self.assertNotIn(self.active_class.id, ids)

    def test_student_cannot_register_for_cancelled_class(self):
        self.active_class.status = Class.Status.CANCELLED
        self.active_class.save(update_fields=['status'])

        self.auth_as(self.student)
        response = self.client.post(
            reverse('classes:class-register', kwargs={'pk': self.active_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('class', response.data['errors'])
