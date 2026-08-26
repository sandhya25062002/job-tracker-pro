from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from tracker.models import JobApplication


class Command(BaseCommand):
    help = 'Sends email reminders for follow-ups and interviews scheduled for today'

    def handle(self, *args, **options):
        today = timezone.localdate()

        # ── Follow-up reminders ─────────────────────────────────────
        follow_ups_today = JobApplication.objects.filter(
            follow_up_date=today
        ).exclude(status='rejected')

        for app in follow_ups_today:
            send_mail(
                subject=f'Follow-up Reminder: {app.company}',
                message=(
                    f'Hi {app.user.first_name or app.user.username},\n\n'
                    f'This is a reminder to follow up on your application for '
                    f'{app.role} at {app.company} today.\n\n'
                    f'Good luck!\n- Job Tracker Pro'
                ),
                from_email='noreply@jobtracker.com',
                recipient_list=[app.user.email],
            )
            self.stdout.write(self.style.SUCCESS(f'Follow-up email sent for {app.company} to {app.user.email}'))

        # ── Interview reminders ─────────────────────────────────────
        interviews_today = JobApplication.objects.filter(
            interview_date__date=today
        ).exclude(status='rejected')

        for app in interviews_today:
            send_mail(
                subject=f'Interview Today: {app.company}',
                message=(
                    f'Hi {app.user.first_name or app.user.username},\n\n'
                    f'Reminder: you have an interview today for {app.role} at '
                    f'{app.company} at {app.interview_date.strftime("%I:%M %p")}.\n\n'
                    f'All the best!\n- Job Tracker Pro'
                ),
                from_email='noreply@jobtracker.com',
                recipient_list=[app.user.email],
            )
            self.stdout.write(self.style.SUCCESS(f'Interview email sent for {app.company} to {app.user.email}'))

        total = follow_ups_today.count() + interviews_today.count()
        self.stdout.write(self.style.SUCCESS(f'Done. {total} reminder email(s) sent.'))