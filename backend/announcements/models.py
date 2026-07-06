from django.db import models


class Announcement(models.Model):
    title = models.CharField(max_length=200, verbose_name='عنوان')
    content = models.TextField(verbose_name='محتوا')
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='announcements',
        verbose_name='ایجادکننده',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    is_active = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'اطلاعیه'
        verbose_name_plural = 'اطلاعیه‌ها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['created_by']),
        ]

    def __str__(self):
        return self.title
