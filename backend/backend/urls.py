from django.contrib import admin
from django.urls import path, include
from users.views import LoginView, UserMeView, RegisterView, get_csrf_token
from users import views
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='events')
router.register(r'registrations', views.RegistrationViewSet, basename='registrations')

urlpatterns = [
    path("admin/", admin.site.urls),

    # Login / Register / CSRF
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/csrf/", get_csrf_token, name="csrf"),
    path("api/user/me/", UserMeView.as_view(), name="user-me"), 
    path("api/registrations/unregister/<int:event_id>/", views.unregister_event),

    # Main API routes
    path("api/", include(router.urls)),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
