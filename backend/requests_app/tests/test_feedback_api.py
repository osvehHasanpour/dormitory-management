from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from ideas.models import IdeaComplaint
from users.models import Role, User


class FeedbackAPITestBase(APITestCase):
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

        self.other_student = User.objects.create(
            personnel_code='401234568',
            national_code='1234567891',
            first_name='مریم',
            last_name='احمدی',
            role=self.student_role,
        )
        self.other_student.set_password('student-pass')
        self.other_student.save()

    def auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class ComplaintRESTAPITests(FeedbackAPITestBase):
    def test_student_can_submit_complaint(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('complaints:complaint-create'),
            {
                'title': 'سر و صدای شبانه در راهرو',
                'description': 'از ساعت ۲۳ تا ۱ بامداد موسیقی بلند پخش می‌شود.',
                'category': IdeaComplaint.Category.SECURITY,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], 'شکایت شما با موفقیت ثبت شد.')
        self.assertEqual(response.data['data']['type'], IdeaComplaint.Type.COMPLAINT)
        self.assertEqual(response.data['data']['status'], IdeaComplaint.Status.PENDING)

    def test_my_complaints_list(self):
        complaint = IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.COMPLAINT,
            title='گرمای ناکافی اتاق',
            description='شوفاژ اتاق ۲۰۵ به‌درستی کار نمی‌کند.',
            status=IdeaComplaint.Status.PENDING,
        )
        self.auth_as(self.student)
        response = self.client.get(reverse('complaints:my-complaints'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['data']['results']]
        self.assertIn(complaint.title, titles)

    def test_cannot_view_other_student_complaint(self):
        complaint = IdeaComplaint.objects.create(
            user=self.other_student,
            type=IdeaComplaint.Type.COMPLAINT,
            title='شکایت دیگران',
            description='فقط برای مالک قابل مشاهده است.',
            status=IdeaComplaint.Status.PENDING,
        )
        self.auth_as(self.student)
        response = self.client.get(
            reverse('complaints:complaint-detail', kwargs={'pk': complaint.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SuggestionRESTAPITests(FeedbackAPITestBase):
    def test_student_can_submit_suggestion(self):
        self.auth_as(self.student)
        response = self.client.post(
            reverse('suggestions:suggestion-create'),
            {
                'title': 'برنامه فیلم‌برداری فرهنگی',
                'description': 'هر ماه یک شب فیلم مستند دانشجویی نمایش داده شود.',
                'category': IdeaComplaint.Category.EDUCATION,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], 'پیشنهاد شما با موفقیت ثبت شد.')
        self.assertEqual(response.data['data']['type'], IdeaComplaint.Type.SUGGESTION)

    def test_my_suggestions_list(self):
        suggestion = IdeaComplaint.objects.create(
            user=self.student,
            type=IdeaComplaint.Type.SUGGESTION,
            title='کلاس زبان انگلیسی',
            description='کلاس مکالمه سطح مبتدی در سالن اجتماعات برگزار شود.',
            status=IdeaComplaint.Status.PENDING,
        )
        self.auth_as(self.student)
        response = self.client.get(reverse('suggestions:my-suggestions'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['data']['results']]
        self.assertIn(suggestion.title, titles)
