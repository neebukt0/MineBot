from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Bot
from .serializers import BotSerializer
from .services import create_bot_file

import subprocess
from pathlib import Path

from rest_framework.views import APIView
from rest_framework.response import Response

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
    


class StartBotView(APIView):
    def post(self, request, bot_id):
        bot_file = Path("bots_runtime") / f"{bot_id}.js"
        if not bot_file.exists():
            return Response(
                {"error": "Bot file not found"},
                status=404
            )
        subprocess.Popen(
            ["node", str(bot_file)],
            cwd="bots_runtime"
        )
        return Response({
            "status": "started",
            "bot_id": bot_id
        })  
    
