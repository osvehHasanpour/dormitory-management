from django.db import models
from django.db.models import Q


class Block(models.Model):
    name = models.CharField(max_length=100, verbose_name='نام بلوک')
    total_floors = models.PositiveIntegerField(verbose_name='تعداد طبقات')
    room_numbers = models.JSONField(verbose_name='شماره اتاق‌ها')

    class Meta:
        verbose_name = 'بلوک'
        verbose_name_plural = 'بلوک‌ها'
        ordering = ['name']

    def __str__(self):
        return self.name


class Room(models.Model):
    block = models.ForeignKey(
        Block,
        on_delete=models.CASCADE,
        related_name='rooms',
        verbose_name='بلوک',
    )
    room_number = models.CharField(max_length=20, verbose_name='شماره اتاق')
    floor = models.PositiveIntegerField(verbose_name='طبقه')
    capacity = models.PositiveIntegerField(verbose_name='ظرفیت')

    class Meta:
        verbose_name = 'اتاق'
        verbose_name_plural = 'اتاق‌ها'
        ordering = ['block', 'floor', 'room_number']
        unique_together = ('block', 'room_number')

    def __str__(self):
        return f'{self.block.name} - اتاق {self.room_number}'


class RoomAssignment(models.Model):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='room_assignments',
        verbose_name='کاربر',
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name='اتاق',
    )
    assigned_from = models.DateField(verbose_name='تاریخ شروع')
    assigned_to = models.DateField(null=True, blank=True, verbose_name='تاریخ پایان')
    is_current = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'تخصیص اتاق'
        verbose_name_plural = 'تخصیص‌های اتاق'
        ordering = ['-assigned_from']
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=Q(is_current=True),
                name='unique_active_room_assignment_per_user',
            ),
        ]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['room']),
            models.Index(fields=['is_current']),
        ]

    def __str__(self):
        return f'{self.user} → {self.room}'
