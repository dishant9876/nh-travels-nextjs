import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or update the Django superuser for NH Travels."

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.getenv("DJANGO_SUPERUSER_USERNAME")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        if not username:
            raise CommandError(
                "DJANGO_SUPERUSER_USERNAME is not configured."
            )

        if not email:
            raise CommandError(
                "DJANGO_SUPERUSER_EMAIL is not configured."
            )

        if not password:
            raise CommandError(
                "DJANGO_SUPERUSER_PASSWORD is not configured."
            )

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": False,
                "is_superuser": True,
                "is_active": True,
            },
        )

        user.email = email
        user.is_staff = False
        user.is_superuser = True
        user.is_active = True

        # Only update the password if it is different.
        if not user.check_password(password):
            user.set_password(password)

        user.save()

        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{username}' created successfully."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{username}' already exists. "
                    "Permissions/password have been updated."
                )
            )