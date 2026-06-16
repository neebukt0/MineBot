from rest_framework import serializers
from .models import Bot

class BotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bot
        fields = "__all__"
        read_only_fields = ("owner",)