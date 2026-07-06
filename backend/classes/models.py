from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Class(models.Model):
    class Category(models.TextChoices):
        EDUCATIONAL = 'educational', 'آموزشی'
        SPORTS = 'sports', 'ورزشی'
        CULTURAL = 'cultural', 'فرهنگی'
        ART = 'art', 'هنری'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'فعال'
        COMPLETED = 'completed', 'پایان‌یافته'
        CANCELLED = 'cancelled', 'لغو شده'

    title = models.CharField(max_length=200, verbose_name='عنوان')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    location = models.CharField(max_length=200, blank=True, verbose_name='مکان')
    capacity = models.PositiveIntegerField(verbose_name='ظرفیت')
    start_datetime = models.DateTimeField(verbose_name='زمان شروع')
    end_datetime = models.DateTimeField(verbose_name='زمان پایان')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name='وضعیت',
    )
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='created_classes',
        verbose_name='ایجادکننده',
    )
    teacher = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='taught_classes',
        verbose_name='مدرس',
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        verbose_name='دسته‌بندی',
    )

    class Meta:
        verbose_name = 'کلاس'
        verbose_name_plural = 'کلاس‌ها'
        ordering = ['start_datetime']

    def __str__(self):
        return self.title

    @property
    def registered_count(self):
        return self.registrations.filter(is_cancelled=False).count()

    @property
    def remaining_capacity(self):
        return self.capacity - self.registered_count

    @property
    def is_full(self):
        return self.remaining_capacity <= 0


class ClassRegistration(models.Model):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='class_registrations',
        verbose_name='کاربر',
    )
    class_instance = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='registrations',
        db_column='class_id',
        verbose_name='کلاس',
    )
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name='زمان ثبت‌نام')
    is_cancelled = models.BooleanField(default=False, verbose_name='لغو شده')
    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='زمان لغو',
    )

    class Meta:
        verbose_name = 'ثبت‌نام کلاس'
        verbose_name_plural = 'ثبت‌نام‌های کلاس'
        ordering = ['-registered_at']
        unique_together = ('user', 'class_instance')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['class_instance']),
            models.Index(fields=['is_cancelled']),
        ]

    def save(self, *args, **kwargs):
        if self.is_cancelled and self.cancelled_at is None:
            self.cancelled_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user} → {self.class_instance.title}'


class Rating(models.Model):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='ratings',
        verbose_name='کاربر',
    )
    class_instance = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='ratings',
        db_column='class_id',
        verbose_name='کلاس',
    )
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='امتیاز',
    )
    comment = models.TextField(blank=True, verbose_name='نظر')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')

    class Meta:
        verbose_name = 'امتیاز'
        verbose_name_plural = 'امتیازها'
        ordering = ['-created_at']
        unique_together = ('user', 'class_instance')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['class_instance']),
        ]

    def __str__(self):
        return f'{self.user} - {self.score}/5'
