import uuid

from django.conf import settings
from django.db import models


class Bot(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=255)
    description = models.TextField()

    username = models.CharField(
        max_length=255,
        default="Bot"
    )

    server_ip = models.CharField(
        max_length=255,
        default="localhost"
    )

    server_port = models.IntegerField(
        default=25565
    )

    version = models.CharField(
        max_length=50,
        default="1.12.2"
    )