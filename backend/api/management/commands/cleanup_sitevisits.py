from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from api.models import SiteVisit


class Command(BaseCommand):
    help = "Delete SiteVisit records older than the specified number of days (default: 90)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=90,
            help="Delete records older than this many days (default: 90)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show how many records would be deleted without actually deleting",
        )

    def handle(self, *args, **options):
        days = options["days"]
        dry_run = options["dry_run"]
        cutoff = timezone.now() - timedelta(days=days)

        queryset = SiteVisit.objects.filter(visited_at__lt=cutoff)
        count = queryset.count()

        if dry_run:
            self.stdout.write(f"Would delete {count} SiteVisit records older than {days} days.")
            return

        if count == 0:
            self.stdout.write("No old SiteVisit records to delete.")
            return

        deleted, _ = queryset.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} SiteVisit records older than {days} days."))
