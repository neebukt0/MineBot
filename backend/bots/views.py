from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Bot
from .serializers import BotSerializer
from .services import create_bot_file, send_command_to_bot, get_bot_status


class BotViewSet(ModelViewSet):
    serializer_class = BotSerializer
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer):
        bot = serializer.save(owner=self.request.user)
        try:
            create_bot_file(bot)
        except Exception as e:
            print("create_bot_file error:", e)
    
    def get_queryset(self):
        return Bot.objects.filter(owner=self.request.user)    
    
