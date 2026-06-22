import os
import subprocess
from pathlib import Path

from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Bot
from .serializers import BotSerializer


from .services import create_bot_file 


class BotViewSet(viewsets.ModelViewSet):
    queryset = Bot.objects.all()
    serializer_class = BotSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):

        bot = serializer.save(owner=self.request.user)
        

        create_bot_file(bot)

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        # Получаем объект бота из базы данных
        bot_instance = self.get_object() 
        bot_file = Path("bots_runtime") / f"{pk}.js"

        # Если файла почему-то нет на диске — генерируем его заново на лету
        if not bot_file.exists():
            try:
                create_bot_file(bot_instance)
            except Exception as e:
                return Response({"error": f"Failed to generate file: {str(e)}"}, status=500)

        # Теперь запускаем процесс
        subprocess.Popen(["node", str(bot_file.name)], cwd="bots_runtime")

        return Response({"status": "started", "bot_id": pk})

    @action(detail=True, methods=["delete"])
    def delete_bot(self, request, pk=None):
        bot_file = Path("bots_runtime") / f"{pk}.js"


        if bot_file.exists():
            try:
                os.remove(bot_file)
            except OSError:
                pass 
                
        # Удаляем запись из базы данных
        instance = self.get_object()
        instance.delete()

        return Response({"status": "deleted", "bot_id": pk})