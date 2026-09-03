from django.urls import path

from .api_views import (
    CSRFView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    TokenLoginView,
    TokenLogoutView,
    TokenMeView,
    TokenRegisterView,
)

urlpatterns = [
    # Session + CSRF based (web frontend)
    path('csrf/', CSRFView.as_view(), name='api-csrf'),
    path('register/', RegisterView.as_view(), name='api-register'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('me/', MeView.as_view(), name='api-me'),

    # Token based (React Native app)
    path('token/register/', TokenRegisterView.as_view(), name='api-token-register'),
    path('token/login/', TokenLoginView.as_view(), name='api-token-login'),
    path('token/logout/', TokenLogoutView.as_view(), name='api-token-logout'),
    path('token/me/', TokenMeView.as_view(), name='api-token-me'),
]
