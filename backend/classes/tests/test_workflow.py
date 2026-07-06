from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from classes.exceptions import ClassServiceError
from classes.models import Class, ClassRegistration
from classes.services.class_service import ClassService
from users.models import Role, User


class ClassWorkflowTests(TestCase):
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
        for index in range(3):
            student = User.objects.create(
                personnel_code=f'40123456{index}',
                national_code=f'123456789{index}',
                first_name='دانشجو',
                last_name=str(index),
                role=self.student_role,
            )
            self.students.append(student)

        now = timezone.now()
        self.class_obj = Class.objects.create(
            title='کلاس محدود',
            description='ظرفیت ۲ نفر',
            capacity=2,
            start_datetime=now + timedelta(days=1),
            end_datetime=now + timedelta(days=1, hours=2),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.EDUCATIONAL,
        )

    def test_capacity_blocks_third_registration(self):
        ClassService.register(user=self.students[0], class_id=self.class_obj.pk)
        ClassService.register(user=self.students[1], class_id=self.class_obj.pk)

        with self.assertRaises(ClassServiceError) as ctx:
            ClassService.register(user=self.students[2], class_id=self.class_obj.pk)

        self.assertIn('ظرفیت', ctx.exception.message)

    def test_cancel_frees_seat_for_another_student(self):
        ClassService.register(user=self.students[0], class_id=self.class_obj.pk)
        ClassService.register(user=self.students[1], class_id=self.class_obj.pk)

        ClassService.cancel_registration(user=self.students[0], class_id=self.class_obj.pk)
        ClassService.register(user=self.students[2], class_id=self.class_obj.pk)

        self.assertTrue(
            ClassRegistration.objects.filter(
                user=self.students[2],
                class_instance=self.class_obj,
                is_cancelled=False,
            ).exists(),
        )

    def test_re_register_after_cancel_reuses_same_row(self):
        ClassService.register(user=self.students[0], class_id=self.class_obj.pk)
        registration = ClassRegistration.objects.get(
            user=self.students[0],
            class_instance=self.class_obj,
        )
        registration_id = registration.pk

        ClassService.cancel_registration(user=self.students[0], class_id=self.class_obj.pk)
        ClassService.register(user=self.students[0], class_id=self.class_obj.pk)

        registration.refresh_from_db()
        self.assertEqual(registration.pk, registration_id)
        self.assertFalse(registration.is_cancelled)

    def test_rating_requires_enrollment(self):
        now = timezone.now()
        ended_class = Class.objects.create(
            title='کلاس تمام‌شده',
            description='',
            capacity=5,
            start_datetime=now - timedelta(days=2),
            end_datetime=now - timedelta(hours=1),
            created_by=self.supervisor,
            teacher=self.supervisor,
            category=Class.Category.CULTURAL,
        )

        with self.assertRaises(ClassServiceError) as ctx:
            ClassService.submit_rating(
                user=self.students[0],
                class_id=ended_class.pk,
                score=5,
            )

        self.assertIn('ثبت‌نام', ctx.exception.message)
