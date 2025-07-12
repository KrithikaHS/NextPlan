from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RegisterView,UserMeView, get_current_user,get_csrf_token, EventViewSet, RegistrationViewSet,unregister_event

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'registrations', RegistrationViewSet, basename='registration')
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('csrf/', get_csrf_token, name='csrf'),
    path("api/registrations/unregister/<int:event_id>/", unregister_event),
    path('/user/me/', get_current_user), 
    path("user/me/", UserMeView.as_view(), name="user-me"),
    path('api/', include(router.urls)),
    path('', include(router.urls)),

    path('', include(router.urls)),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
