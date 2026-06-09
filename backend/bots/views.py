from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Bot
from .serializers import BotSerializer
from .services import create_bot_file


class BotListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        bots = Bot.objects.filter(
            owner=request.user
        )
        serializer = BotSerializer(
            bots,
            many=True
        )
        return Response(serializer.data)
    def post(self, request):
        serializer = BotSerializer(
            data=request.data
        )
        if serializer.is_valid():
            bot = serializer.save(
                owner=request.user
            )
            create_bot_file(bot)
            return Response(
                BotSerializer(bot).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )