from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from classes.models import Class, ClassRegistration, Rating
from users.models import Role, User


class ClassesAPITestBase(APITestCase):
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

        now = timezone.now()
        self.active_class = Class.objects.create(
            title='کلاس یوگا',
            description='آموزش یوگا',
            capacity=2,
            start_datetime=now + timedelta(days=2),
            end_datetime=now + timedelta(days=2, hours=2),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.SPORTS,
        )
        self.ended_class = Class.objects.create(
            title='کلاس خوشنویسی',
            description='آموزش خط',
            capacity=10,
            start_datetime=now - timedelta(days=5),
            end_datetime=now - timedelta(days=5, hours=-2),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.ART,
        )

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class ClassListDetailAPITests(ClassesAPITestBase):
    def test_student_lists_active_classes_only(self):
        self.auth_as(self.student)
        response = self.client.get(reverse('classes:class-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        ids = [item['id'] for item in response.data['data']['results']]
        self.assertIn(self.active_class.id, ids)
        self.assertNotIn(self.ended_class.id, ids)

    def test_class_detail_includes_popup_fields(self):
        self.auth_as(self.student)
        response = self.client.get(
            reverse('classes:class-detail', kwargs={'pk': self.active_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertIn('is_enrolled', data)
        self.assertIn('can_rate', data)
        self.assertIn('remaining_capacity', data)
        self.assertIn('average_rating', data)
        self.assertFalse(data['is_enrolled'])
        self.assertFalse(data['can_rate'])

    def test_supervisor_cannot_access_classes_api(self):
        self.auth_as(self.supervisor)
        response = self.client.get(reverse('classes:class-list'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])


class ClassRegistrationAPITests(ClassesAPITestBase):
    def test_student_can_register_for_active_class(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('classes:class-register', kwargs={'pk': self.active_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['data']['is_enrolled'])
        self.assertTrue(
            ClassRegistration.objects.filter(
                user=self.student,
                class_instance=self.active_class,
                is_cancelled=False,
            ).exists(),
        )

    def test_duplicate_registration_is_rejected(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.active_class,
        )

        self.auth_as(self.student)
        response = self.client.post(
            reverse('classes:class-register', kwargs={'pk': self.active_class.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('registration', response.data['errors'])

    def test_cancel_registration_restores_capacity(self):
        registration = ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.active_class,
        )
        ClassRegistration.objects.create(
            user=self.other_student,
            class_instance=self.active_class,
        )

        self.auth_as(self.student)
        cancel_response = self.client.delete(
            reverse('classes:class-register', kwargs={'pk': self.active_class.pk}),
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)

        registration.refresh_from_db()
        self.assertTrue(registration.is_cancelled)

        re_register_response = self.client.post(
            reverse('classes:class-register', kwargs={'pk': self.active_class.pk}),
        )
        self.assertEqual(re_register_response.status_code, status.HTTP_201_CREATED)

    def test_my_classes_returns_active_enrollments(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.active_class,
        )

        self.auth_as(self.student)
        response = self.client.get(reverse('classes:my-classes'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']['results']), 1)
        self.assertEqual(response.data['data']['results'][0]['id'], self.active_class.id)


class ClassRatingAPITests(ClassesAPITestBase):
    def test_rating_rejected_before_class_ends(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.active_class,
        )

        self.auth_as(self.student)
        response = self.client.post(
            reverse('classes:class-rate', kwargs={'pk': self.active_class.pk}),
            {'score': 5},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_student_can_rate_ended_class(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.ended_class,
        )

        self.auth_as(self.student)
        response = self.client.post(
            reverse('classes:class-rate', kwargs={'pk': self.ended_class.pk}),
            {'score': 4},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['submitted_rating'], 4)
        self.assertFalse(response.data['data']['can_rate'])
        self.assertTrue(
            Rating.objects.filter(
                user=self.student,
                class_instance=self.ended_class,
                score=4,
            ).exists(),
        )

    def test_duplicate_rating_is_rejected(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.ended_class,
        )
        Rating.objects.create(
            user=self.student,
            class_instance=self.ended_class,
            score=3,
        )

        self.auth_as(self.student)
        response = self.client.post(
            reverse('classes:class-rate', kwargs={'pk': self.ended_class.pk}),
            {'score': 5},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('rating', response.data['errors'])

    def test_my_ended_classes_lists_completed_enrollments(self):
        ClassRegistration.objects.create(
            user=self.student,
            class_instance=self.ended_class,
        )

        self.auth_as(self.student)
        response = self.client.get(reverse('classes:my-ended-classes'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']['results']), 1)
        self.assertTrue(response.data['data']['results'][0]['can_rate'])
