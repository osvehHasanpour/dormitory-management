from django.db import models


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
    title = models.CharField(max_length=200, verbose_name='عنوان')
    description = models.TextField(verbose_name='توضیحات')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='وضعیت',
    )
    supervisor_response = models.TextField(blank=True, verbose_name='پاسخ سرپرست')
    upvotes = models.IntegerField(default=0, verbose_name='رأی مثبت')

    class Meta:
        verbose_name = 'ایده / شکایت'
        verbose_name_plural = 'ایده‌ها و شکایات'
        ordering = ['-id']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.title


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
