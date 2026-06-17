from rest_framework.routers import DefaultRouter
from .views import BotViewSet, StartBotView

router = DefaultRouter()
router.register(r"bots", BotViewSet, basename="bots")
router.register(r"bots/start", StartBotView, basename="start-bot")

urlpatterns = router.urls