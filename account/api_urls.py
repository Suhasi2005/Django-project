from django.urls import path

from .api_views import CSRFView, LoginView, LogoutView, MeView, RegisterView

urlpatterns = [
    path('csrf/', CSRFView.as_view(), name='api-csrf'),
    path('register/', RegisterView.as_view(), name='api-register'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('me/', MeView.as_view(), name='api-me'),
]
