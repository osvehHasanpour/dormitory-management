from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from announcements.models import Announcement
from classes.models import Class, ClassRegistration, Rating
from core.models import Notification
from dorms.models import Block, Room, RoomAssignment
from ideas.models import IdeaComplaint, Vote
from requests_app.models import (
    BoothRequest,
    CleaningRequest,
    InventoryItem,
    ItemRequest,
    MaintenanceRequest,
    RequestBase,
)
from users.models import Role, User


class Command(BaseCommand):
    help = 'Seed the database with realistic Persian sample data (≥5 records per model).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Clear existing data and re-seed (default when DB is empty).',
        )

    def handle(self, *args, **options):
        if Role.objects.exists() and not options['force']:
            self.stdout.write(
                self.style.WARNING(
                    'Database already seeded. Use --force to clear and re-seed.',
                ),
            )
            return

        self.stdout.write('Clearing existing data...')
        self._clear_data()

        self.stdout.write('Creating roles...')
        roles = self._create_roles()

        self.stdout.write('Creating blocks and rooms...')
        blocks, rooms = self._create_blocks_and_rooms()

        self.stdout.write('Creating users...')
        users = self._create_users(roles, blocks)

        self.stdout.write('Creating room assignments...')
        self._create_room_assignments(users['students'], rooms)

        self.stdout.write('Creating inventory items...')
        items = self._create_inventory_items()

        self.stdout.write('Creating requests...')
        self._create_requests(users, items)

        self.stdout.write('Creating ideas and votes...')
        ideas = self._create_ideas_and_votes(users)

        self.stdout.write('Creating classes, registrations, and ratings...')
        self._create_classes(users)

        self.stdout.write('Creating announcements...')
        self._create_announcements(users)

        self.stdout.write('Creating notifications...')
        self._create_notifications(users)

        self.stdout.write(self.style.SUCCESS('Database seeded successfully.'))

    def _clear_data(self):
        Notification.objects.all().delete()
        Announcement.objects.all().delete()
        Rating.objects.all().delete()
        ClassRegistration.objects.all().delete()
        Class.objects.all().delete()
        Vote.objects.all().delete()
        IdeaComplaint.objects.all().delete()
        BoothRequest.objects.all().delete()
        ItemRequest.objects.all().delete()
        CleaningRequest.objects.all().delete()
        MaintenanceRequest.objects.all().delete()
        RequestBase.objects.all().delete()
        InventoryItem.objects.all().delete()
        RoomAssignment.objects.all().delete()
        Room.objects.all().delete()
        Block.objects.all().delete()
        User.objects.all().delete()
        Role.objects.all().delete()

    def _create_roles(self):
        roles_data = [
            (Role.Name.STUDENT, 'دانشجوی ساکن خوابگاه'),
            (Role.Name.SUPERVISOR, 'سرپرست بلوک خوابگاه'),
            (Role.Name.ADMIN, 'مدیر سیستم خوابگاه'),
        ]
        roles = {}
        for name, description in roles_data:
            role, _ = Role.objects.get_or_create(name=name, defaults={'description': description})
            roles[name] = role
        return roles

    def _create_blocks_and_rooms(self):
        blocks_data = [
            ('بلوک الف', 4, ['101', '102', '103', '201', '202']),
            ('بلوک ب', 5, ['101', '102', '103', '201', '202', '301']),
            ('بلوک ج', 3, ['101', '102', '201', '202']),
            ('بلوک د', 6, ['101', '102', '103', '201', '202', '301', '302']),
            ('بلوک ه', 4, ['101', '102', '201', '202', '203']),
        ]
        blocks = []
        rooms = []
        for name, floors, room_nums in blocks_data:
            block = Block.objects.create(
                name=name,
                total_floors=floors,
                room_numbers=room_nums,
            )
            blocks.append(block)
            for rn in room_nums:
                floor = int(rn[0])
                room = Room.objects.create(
                    block=block,
                    room_number=rn,
                    floor=floor,
                    capacity=4 if floor <= 2 else 3,
                )
                rooms.append(room)
        return blocks, rooms

    def _create_user(self, personnel_code, national_code, first_name, last_name, role, block=None):
        user = User(
            personnel_code=personnel_code,
            national_code=national_code,
            first_name=first_name,
            last_name=last_name,
            role=role,
            block=block,
            email=f'{personnel_code}@dormitory.local',
        )
        user.set_password(user.national_code)
        user.save()
        return user

    def _create_users(self, roles, blocks):
        admin = self._create_user(
            '100000001', '0012345678', 'رضا', 'مدیری', roles[Role.Name.ADMIN],
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()

        supervisors = [
            self._create_user(
                '200000001', '1234567890', 'محمد', 'کریمی',
                roles[Role.Name.SUPERVISOR], blocks[0],
            ),
            self._create_user(
                '200000002', '2345678901', 'فاطمه', 'احمدی',
                roles[Role.Name.SUPERVISOR], blocks[1],
            ),
        ]

        students_data = [
            ('401234567', '3456789012', 'علی', 'رضایی', blocks[0]),
            ('401234568', '4567890123', 'زهرا', 'محمدی', blocks[0]),
            ('401234569', '5678901234', 'حسین', 'نوری', blocks[1]),
            ('401234570', '6789012345', 'مریم', 'حسینی', blocks[1]),
            ('401234571', '7890123456', 'امیر', 'جعفری', blocks[2]),
            ('401234572', '8901234567', 'سارا', 'کاظمی', blocks[2]),
            ('401234573', '9012345678', 'پارسا', 'موسوی', blocks[3]),
        ]
        students = [
            self._create_user(pc, nc, fn, ln, roles[Role.Name.STUDENT], block)
            for pc, nc, fn, ln, block in students_data
        ]

        return {
            'admin': admin,
            'supervisors': supervisors,
            'students': students,
            'all': [admin, *supervisors, *students],
        }

    def _create_room_assignments(self, students, rooms):
        today = date.today()
        for i, student in enumerate(students):
            room = rooms[i % len(rooms)]
            RoomAssignment.objects.create(
                user=student,
                room=room,
                assigned_from=today - timedelta(days=90 + i * 10),
                is_current=True,
            )
        past_assignments = [
            (students[0], rooms[5], today - timedelta(days=200), today - timedelta(days=91)),
            (students[1], rooms[6], today - timedelta(days=180), today - timedelta(days=91)),
            (students[2], rooms[7], today - timedelta(days=150), today - timedelta(days=91)),
            (students[3], rooms[8], today - timedelta(days=120), today - timedelta(days=91)),
            (students[4], rooms[9], today - timedelta(days=100), today - timedelta(days=91)),
        ]
        for student, room, start, end in past_assignments:
            RoomAssignment.objects.create(
                user=student,
                room=room,
                assigned_from=start,
                assigned_to=end,
                is_current=False,
            )

    def _create_inventory_items(self):
        items_data = [
            ('ملحفه تک‌نفره', 'لوازم خواب', 50, 'ملحفه نخی با کیفیت مناسب'),
            ('بالش فوم', 'لوازم خواب', 30, 'بالش ارتوپدیک'),
            ('پتو زمستانی', 'لوازم خواب', 25, 'پتو پشمی ضخیم'),
            ('جالباسی فلزی', 'لوازم اتاق', 15, 'جالباسی سه‌طبقه'),
            ('سطل زباله', 'لوازم اتاق', 40, 'سطل پلاستیکی با درب'),
            ('چراغ مطالعه', 'لوازم برقی', 20, 'چراغ LED کم‌مصرف'),
        ]
        return [
            InventoryItem.objects.create(
                item_name=name, category=cat, quantity=qty, description=desc,
            )
            for name, cat, qty, desc in items_data
        ]

    def _create_requests(self, users, items):
        students = users['students']
        supervisors = users['supervisors']
        now = timezone.now()

        maintenance_data = [
            ('آشپزخانه بلوک الف', 'تعویض شیر آب آشپزخانه', RequestBase.Status.PENDING),
            ('سرویس بهداشتی طبقه ۲', 'نشت آب از لوله زیر سینک', RequestBase.Status.IN_PROGRESS),
            ('راهرو بلوک ب', 'لامپ راهرو خاموش است', RequestBase.Status.APPROVED),
            ('اتاق ۲۰۱', 'قفل در اتاق خراب شده', RequestBase.Status.COMPLETED),
            ('لاندری بلوک ج', 'ماشین لباس‌شویی صدا می‌دهد', RequestBase.Status.REJECTED),
            ('سالن مطالعه', 'کولر گازی کار نمی‌کند', RequestBase.Status.PENDING),
        ]
        for i, (location, desc, status) in enumerate(maintenance_data):
            req = MaintenanceRequest(
                request_type=RequestBase.RequestType.MAINTENANCE,
                status=status,
                description=desc,
                user=students[i % len(students)],
                handled_by=supervisors[i % len(supervisors)] if status != RequestBase.Status.PENDING else None,
                location=location,
            )
            req.save()

        cleaning_data = [
            ('سرویس بهداشتی بلوک الف', 'نظافت عمیق سرویس بهداشتی'),
            ('راهرو طبقه ۳ بلوک ب', 'شستشوی کف راهرو'),
            ('اتاق مشترک ۱۰۲', 'نظافت پس از ترک اتاق'),
            ('آشپزخانه بلوک د', 'ضدعفونی سطوح آشپزخانه'),
            ('سالن غذاخوری', 'نظافت میز و صندلی‌ها'),
            ('لابی ورودی', 'شیشه‌شویی درب ورودی'),
        ]
        for i, (location, desc) in enumerate(cleaning_data):
            CleaningRequest.objects.create(
                request_type=RequestBase.RequestType.CLEANING,
                status=RequestBase.Status.PENDING if i % 2 == 0 else RequestBase.Status.APPROVED,
                description=desc,
                user=students[i % len(students)],
                handled_by=supervisors[0] if i % 2 else None,
                location=location,
                preferred_date=date.today() + timedelta(days=i + 1),
            )

        item_data = [
            (0, 1, 'در انتظار تحویل'),
            (1, 2, 'تحویل داده شد'),
            (2, 1, 'در انتظار تحویل'),
            (3, 1, 'تحویل داده شد'),
            (4, 3, 'در انتظار تحویل'),
            (5, 1, 'رد شده'),
        ]
        for i, (item_idx, qty, delivery) in enumerate(item_data):
            ItemRequest.objects.create(
                request_type=RequestBase.RequestType.ITEM,
                status=RequestBase.Status.APPROVED if 'تحویل' in delivery else RequestBase.Status.REJECTED,
                description=f'درخواست {items[item_idx].item_name}',
                user=students[i % len(students)],
                handled_by=supervisors[i % len(supervisors)],
                item=items[item_idx],
                quantity=qty,
                delivery_status=delivery,
            )

        booth_data = [
            ('غرفه صنایع دستی', 'صنایع دستی و سوغات', date.today() + timedelta(days=14)),
            ('کافه کوچک', 'نوشیدنی و میان‌وعده', date.today() + timedelta(days=21)),
            ('غرفه کتاب', 'کتاب و لوازم‌التحریر', date.today() + timedelta(days=7)),
            ('غرفه گل', 'گل و گیاه', date.today() + timedelta(days=10)),
            ('غرفه عکاسی', 'عکاسی و چاپ', date.today() + timedelta(days=30)),
            ('غرفه بازی', 'بازی فکری', date.today() + timedelta(days=18)),
        ]
        for i, (name, category, event_date) in enumerate(booth_data):
            BoothRequest.objects.create(
                request_type=RequestBase.RequestType.BOOTH,
                status=RequestBase.Status.PENDING if i < 3 else RequestBase.Status.APPROVED,
                description=f'درخواست برپایی {name}',
                user=students[i % len(students)],
                handled_by=supervisors[i % len(supervisors)] if i >= 3 else None,
                name=name,
                category=category,
                event_date=event_date,
                approval_date=date.today() if i >= 3 else None,
            )

    def _create_ideas_and_votes(self, users):
        students = users['students']
        supervisor = users['supervisors'][0]

        ideas_data = [
            (IdeaComplaint.Type.SUGGESTION, IdeaComplaint.Category.WELFARE, 'نصب اینverter در لاندری', 'پیشنهاد نصب اینverter برای صرفه‌جویی برق', IdeaComplaint.Status.PENDING),
            (IdeaComplaint.Type.IDEA, '', 'شب فیلم در سالن', 'برگزاری شب فیلم هر دو هفته یک‌بار', IdeaComplaint.Status.REVIEWED),
            (IdeaComplaint.Type.COMPLAINT, IdeaComplaint.Category.SECURITY, 'سر و صدای شبانه', 'سر و صدای زیاد در بلوک ب پس از ساعت ۲۳', IdeaComplaint.Status.ANSWERED),
            (IdeaComplaint.Type.SUGGESTION, IdeaComplaint.Category.EDUCATION, 'کلاس زبان انگلیسی', 'راه‌اندازی کلاس مکالمه انگلیسی', IdeaComplaint.Status.PENDING),
            (IdeaComplaint.Type.IDEA, '', 'باغچه مشترک', 'ایجاد فضای سبز در حیاط پشتی', IdeaComplaint.Status.REVIEWED),
            (IdeaComplaint.Type.COMPLAINT, IdeaComplaint.Category.MAINTENANCE, 'گرمای اتاق', 'سیستم گرمایشی اتاق ۱۰۳ ضعیف است', IdeaComplaint.Status.REJECTED),
        ]
        ideas = []
        for i, (itype, category, title, desc, status) in enumerate(ideas_data):
            responded_at = None
            responded_within_sla = None
            supervisor_response = ''
            responded_by = None
            if status == IdeaComplaint.Status.ANSWERED:
                supervisor_response = 'در حال بررسی است.'
                responded_at = timezone.now()
                responded_by = supervisor
                responded_within_sla = True
            elif status == IdeaComplaint.Status.REJECTED:
                supervisor_response = 'درخواست تکراری است.'
                responded_at = timezone.now()
                responded_by = supervisor
                responded_within_sla = True

            idea = IdeaComplaint.objects.create(
                user=students[i % len(students)],
                type=itype,
                category=category,
                title=title,
                description=desc,
                status=status,
                supervisor_response=supervisor_response,
                responded_by=responded_by,
                responded_at=responded_at,
                responded_within_sla=responded_within_sla,
                upvotes=i * 2,
            )
            ideas.append(idea)

        vote_pairs = [
            (students[0], ideas[0], Vote.VoteType.UP),
            (students[1], ideas[0], Vote.VoteType.UP),
            (students[2], ideas[1], Vote.VoteType.UP),
            (students[3], ideas[1], Vote.VoteType.DOWN),
            (students[4], ideas[2], Vote.VoteType.UP),
            (students[0], ideas[3], Vote.VoteType.UP),
            (students[1], ideas[4], Vote.VoteType.UP),
            (students[2], ideas[5], Vote.VoteType.DOWN),
        ]
        for student, idea, vote_type in vote_pairs:
            Vote.objects.create(user=student, idea=idea, vote_type=vote_type)

        return ideas

    def _create_classes(self, users):
        supervisors = users['supervisors']
        students = users['students']
        now = timezone.now()

        classes_data = [
            ('کلاس یوگا پیشرفته', 'آموزش حرکات یوگا برای سطح متوسط و پیشرفته', 20, Class.Category.SPORTS),
            ('کارگاه خوشنویسی', 'آموزش خط نستعلیق', 15, Class.Category.ART),
            ('سمینار مدیریت زمان', 'تکنیک‌های مطالعه و برنامه‌ریزی', 30, Class.Category.EDUCATIONAL),
            ('گروه موسیقی سنتی', 'تمرین آواز و ساز محلی', 12, Class.Category.CULTURAL),
            ('کلاس شطرنج', 'آموزش مبتدی تا پیشرفته', 16, Class.Category.EDUCATIONAL),
            ('کارگاه عکاسی', 'اصول عکاسی با موبایل', 18, Class.Category.ART),
        ]
        class_objects = []
        for i, (title, desc, capacity, category) in enumerate(classes_data):
            cls = Class.objects.create(
                title=title,
                description=desc,
                location=f'سالن {i + 1}',
                capacity=capacity,
                start_datetime=now + timedelta(days=7 + i, hours=10),
                end_datetime=now + timedelta(days=7 + i, hours=12),
                created_by=supervisors[i % len(supervisors)],
                teacher=supervisors[(i + 1) % len(supervisors)],
                category=category,
                status=Class.Status.ACTIVE,
            )
            class_objects.append(cls)

        registration_pairs = [
            (students[0], class_objects[0]),
            (students[1], class_objects[1]),
            (students[2], class_objects[2]),
            (students[3], class_objects[3]),
            (students[4], class_objects[4]),
            (students[5], class_objects[5]),
            (students[6], class_objects[0]),
            (students[0], class_objects[1]),
            (students[1], class_objects[2]),
            (students[2], class_objects[3]),
            (students[3], class_objects[4]),
            (students[4], class_objects[5]),
        ]
        for student, cls in registration_pairs:
            ClassRegistration.objects.create(user=student, class_instance=cls)

        cancelled = ClassRegistration.objects.get(user=students[6], class_instance=class_objects[0])
        cancelled.is_cancelled = True
        cancelled.save()

        for i, student in enumerate(students[:6]):
            Rating.objects.create(
                user=student,
                class_instance=class_objects[i % len(class_objects)],
                score=(i % 5) + 1,
            )

    def _create_announcements(self, users):
        supervisors = users['supervisors']
        admin = users['admin']

        announcements_data = [
            ('جلسه عمومی ساکنین', 'جلسه عمومی ساکنین بلوک الف روز پنج‌شنبه ساعت ۱۸ در سالن اجتماعات برگزار می‌شود.', supervisors[0]),
            ('قطعی آب', 'فردا ساعت ۱۰ تا ۱۲ به دلیل تعمیرات، آب بلوک ب قطع خواهد بود.', supervisors[1]),
            ('ثبت‌نام کلاس‌های فرهنگی', 'ثبت‌نام کلاس‌های نیمسال جدید از امروز آغاز شد.', admin),
            ('قوانین سکوت شب', 'یادآوری: سکوت مطلق از ساعت ۲۳ تا ۷ صبح در تمام بلوک‌ها.', supervisors[0]),
            ('جشنواره غذای محلی', 'جشنواره غذای محلی روز جمعه در حیاط مرکزی برگزار می‌شود.', supervisors[1]),
            ('بازدید بهداشتی', 'تیم بهداشت دانشگاه هفته آینده از خوابگاه بازدید خواهد کرد.', admin),
        ]
        for i, (title, content, creator) in enumerate(announcements_data):
            Announcement.objects.create(
                title=title,
                content=content,
                created_by=creator,
                is_active=i < 5,
            )

    def _create_notifications(self, users):
        students = users['students']
        requests = list(RequestBase.objects.all()[:5])

        for i, student in enumerate(students[:5]):
            Notification.objects.create(
                user=student,
                message=f'اعلان نمونه شماره {i + 1}: درخواست شما در حال بررسی است.',
                related_request=requests[i] if i < len(requests) else None,
                is_read=i % 2 == 0,
            )

        Notification.objects.create(
            user=students[0],
            message='به سامانه مدیریت خوابگاه خوش آمدید.',
            is_read=False,
        )
