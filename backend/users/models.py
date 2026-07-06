from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    class Name(models.TextChoices):
        STUDENT = 'student', 'دانشجو'
        SUPERVISOR = 'supervisor', 'سرپرست'
        ADMIN = 'admin', 'مدیر'

    name = models.CharField(
        max_length=20,
        choices=Name.choices,
        unique=True,
        verbose_name='نام نقش',
    )
    description = models.TextField(blank=True, verbose_name='توضیحات')

    class Meta:
        verbose_name = 'نقش'
        verbose_name_plural = 'نقش‌ها'
        ordering = ['name']

    def __str__(self):
        return self.get_name_display()


class User(AbstractUser):
    username = None
    personnel_code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='کد پرسنلی / شماره دانشجویی',
    )
    national_code = models.CharField(
        max_length=10,
        unique=True,
        verbose_name='کد ملی',
    )
    email = models.EmailField(null=True, blank=True, verbose_name='ایمیل')
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name='نقش',
    )
    block = models.ForeignKey(
        'dorms.Block',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name='بلوک',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    USERNAME_FIELD = 'personnel_code'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'national_code']

    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['block']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.personnel_code})'
