from datetime import timedelta

from django.db import models
from django.utils import timezone


FEEDBACK_SLA_HOURS = 72


class IdeaComplaint(models.Model):
    class Type(models.TextChoices):
        SUGGESTION = 'suggestion', 'پیشنهاد'
        IDEA = 'idea', 'ایده'
        COMPLAINT = 'complaint', 'شکایت'

    class Status(models.TextChoices):
        PENDING = 'pending', 'در انتظار'
        REVIEWED = 'reviewed', 'بررسی شده'
        ANSWERED = 'answered', 'پاسخ داده شده'
        REJECTED = 'rejected', 'رد شده'

    class Category(models.TextChoices):
        CLEANING = 'cleaning', 'نظافت'
        FACILITIES = 'facilities', 'امکانات'
        WELFARE = 'welfare', 'رفاهی'
        SECURITY = 'security', 'امنیتی'
        EDUCATION = 'education', 'آموزشی'
        MAINTENANCE = 'maintenance', 'تعمیرات'
        OTHER = 'other', 'سایر'

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='ideas_complaints',
        verbose_name='کاربر',
    )
    type = models.CharField(
        max_length=20,
        choices=Type.choices,
        verbose_name='نوع',
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        blank=True,
        default='',
        verbose_name='دسته‌بندی',
    )
    title = models.CharField(max_length=200, verbose_name='عنوان')
    description = models.TextField(verbose_name='توضیحات')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='وضعیت',
    )
    supervisor_response = models.TextField(blank=True, verbose_name='پاسخ سرپرست')
    responded_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedback_responses',
        verbose_name='سرپرست پاسخ‌دهنده',
    )
    responded_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='زمان پاسخ',
    )
    responded_within_sla = models.BooleanField(
        null=True,
        blank=True,
        verbose_name='پاسخ در مهلت ۷۲ ساعته',
    )
    upvotes = models.IntegerField(default=0, verbose_name='رأی مثبت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        verbose_name = 'ایده / شکایت'
        verbose_name_plural = 'ایده‌ها و شکایات'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['category']),
            models.Index(fields=['created_at']),
            models.Index(fields=['responded_by']),
        ]

    def __str__(self):
        return self.title

    @classmethod
    def compute_sla_compliance(cls, *, created_at, responded_at):
        if responded_at is None or created_at is None:
            return None
        return responded_at <= created_at + timedelta(hours=FEEDBACK_SLA_HOURS)

    def sla_deadline(self):
        if self.created_at is None:
            return None
        return self.created_at + timedelta(hours=FEEDBACK_SLA_HOURS)

    def is_sla_overdue(self):
        deadline = self.sla_deadline()
        if deadline is None:
            return False
        if self.responded_at is not None:
            return False
        return timezone.now() > deadline


class Vote(models.Model):
    class VoteType(models.TextChoices):
        UP = 'up', 'موافق'
        DOWN = 'down', 'مخالف'

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='votes',
        verbose_name='کاربر',
    )
    idea = models.ForeignKey(
        IdeaComplaint,
        on_delete=models.CASCADE,
        related_name='votes',
        verbose_name='ایده',
    )
    vote_type = models.CharField(
        max_length=10,
        choices=VoteType.choices,
        verbose_name='نوع رأی',
    )
    voted_at = models.DateTimeField(auto_now_add=True, verbose_name='زمان رأی')

    class Meta:
        verbose_name = 'رأی'
        verbose_name_plural = 'آراء'
        ordering = ['-voted_at']
        unique_together = ('user', 'idea')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['idea']),
        ]

    def __str__(self):
        return f'{self.user} - {self.get_vote_type_display()}'
