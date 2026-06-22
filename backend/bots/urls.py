from rest_framework.routers import DefaultRouter
from .views import BotViewSet

router = DefaultRouter()
router.register(r"bots", BotViewSet, basename="bots")

urlpatterns = router.urls