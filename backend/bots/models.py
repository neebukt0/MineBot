# bots/models.py

import uuid

from django.db import models
from users.models import User


class Bot(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE
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
    def __str__(self):
        return self.name