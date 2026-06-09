from django.urls import path
from .views import BotListCreateView

urlpatterns = [
    path("bots/", BotListCreateView.as_view(), name="bot-list-create "),
]
