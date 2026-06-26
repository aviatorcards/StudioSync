"""
Management command to flush and reseed the demo database.
Runs all seed scripts in the correct order.

Usage:
    python manage.py reset_demo
    docker compose exec backend python manage.py reset_demo
"""

import importlib.util
from pathlib import Path

from django.core.management import call_command
from django.core.management.base import BaseCommand

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent


def _run_seed(filename):
    """Import and exec a seed script file, returning its module."""
    path = BASE_DIR / filename
    spec = importlib.util.spec_from_file_location(filename, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class Command(BaseCommand):
    help = "Flush and reseed the demo database with fresh sample data"

    def handle(self, *args, **options):
        self.stdout.write("Flushing database...")
        call_command("flush", "--no-input", verbosity=0)

        self.stdout.write("Running migrations...")
        call_command("migrate", "--no-input", verbosity=0)
        call_command("createcachetable", verbosity=0)

        self.stdout.write("Seeding core data (admin, studio, teachers, students)...")
        _run_seed("seed_data.py").seed()

        self.stdout.write("Seeding extra data (lessons, billing, inventory)...")
        _run_seed("seed_extra.py").seed_extra()

        self.stdout.write("Seeding library resources...")
        _run_seed("seed_resources.py").seed_resources()
        _run_seed("seed_extra_resources.py").seed_more_resources()

        self.stdout.write("Seeding gigs and bands...")
        _run_seed("seed_gigs.py").seed()

        self.stdout.write(self.style.SUCCESS("Demo database reset complete!"))
