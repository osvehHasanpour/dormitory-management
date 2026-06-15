from django.db import models


class InventoryItem(models.Model):
    item_name = models.CharField(max_length=200, verbose_name='نام کالا')
    category = models.CharField(max_length=100, verbose_name='دسته‌بندی')
    quantity = models.PositiveIntegerField(verbose_name='موجودی')
    description = models.TextField(blank=True, verbose_name='توضیحات')

    class Meta:
        verbose_name = 'کالای انبار'
        verbose_name_plural = 'کالاهای انبار'
        ordering = ['item_name']

    def __str__(self):
        return self.item_name


class RequestBase(models.Model):
    class RequestType(models.TextChoices):
        MAINTENANCE = 'maintenance', 'تعمیرات'
        CLEANING = 'cleaning', 'نظافت'
        ITEM = 'item', 'کالا'
        BOOTH = 'booth', 'غرفه'

    class Status(models.TextChoices):
        PENDING = 'pending', 'در انتظار'
        IN_PROGRESS = 'in_progress', 'در حال بررسی'
        APPROVED = 'approved', 'تأیید شده'
        REJECTED = 'rejected', 'رد شده'
        COMPLETED = 'completed', 'تکمیل شده'

    request_type = models.CharField(
        max_length=20,
        choices=RequestType.choices,
        verbose_name='نوع درخواست',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='وضعیت',
    )
    description = models.TextField(verbose_name='توضیحات')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='requests',
        verbose_name='درخواست‌دهنده',
    )
    handled_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='handled_requests',
        verbose_name='سرپرست رسیدگی‌کننده',
    )
    ai_content_flag = models.BooleanField(
        null=True,
        blank=True,
        verbose_name='پرچم محتوای هوش مصنوعی',
    )

    class Meta:
        verbose_name = 'درخواست'
        verbose_name_plural = 'درخواست‌ها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['handled_by']),
        ]

    def __str__(self):
        return f'{self.get_request_type_display()} - {self.get_status_display()}'


class MaintenanceRequest(RequestBase):
    location = models.CharField(max_length=200, verbose_name='محل')
    photo_url = models.ImageField(
        upload_to='maintenance/',
        null=True,
        blank=True,
        verbose_name='تصویر',
    )
    description = models.TextField(blank=True, verbose_name='توضیحات تکمیلی')

    class Meta:
        verbose_name = 'درخواست تعمیرات'
        verbose_name_plural = 'درخواست‌های تعمیرات'


class CleaningRequest(RequestBase):
    location = models.CharField(max_length=200, verbose_name='محل')
    preferred_date = models.DateField(verbose_name='تاریخ ترجیحی')
    description = models.TextField(blank=True, verbose_name='توضیحات تکمیلی')

    class Meta:
        verbose_name = 'درخواست نظافت'
        verbose_name_plural = 'درخواست‌های نظافت'


class ItemRequest(RequestBase):
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name='item_requests',
        verbose_name='کالا',
    )
    quantity = models.PositiveIntegerField(verbose_name='تعداد')
    delivery_status = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='وضعیت تحویل',
    )

    class Meta:
        verbose_name = 'درخواست کالا'
        verbose_name_plural = 'درخواست‌های کالا'


class BoothRequest(RequestBase):
    name = models.CharField(max_length=200, verbose_name='نام غرفه یا کسب‌وکار')
    category = models.CharField(max_length=100, verbose_name='نوع کالا یا خدمات')
    event_date = models.DateField(verbose_name='تاریخ رویداد')
    approval_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='تاریخ تأیید',
    )

    class Meta:
        verbose_name = 'درخواست غرفه'
        verbose_name_plural = 'درخواست‌های غرفه'
