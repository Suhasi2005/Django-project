from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .forms import LoginForm, RegistrationForm
from .serializers import UserSerializer


class CSRFView(APIView):
    """
    Call once on app load so the browser gets a csrftoken cookie; the
    frontend reads it and sends it back as the X-CSRFToken header on
    every unsafe (POST/PATCH/DELETE) request.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'csrfToken': get_token(request)})


@method_decorator(csrf_protect, name='dispatch')
class RegisterView(APIView):
    """
    DRF's SessionAuthentication only enforces CSRF for requests that resolve
    to an already-logged-in session user, so an anonymous POST here would
    otherwise sail through unchecked (DRF marks the whole view csrf_exempt
    at the middleware level). csrf_protect on dispatch closes that gap
    explicitly, since login/register are exactly the requests a login-CSRF
    attack targets.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        form = RegistrationForm(request.data)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        form = LoginForm(data=request.data)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(UserSerializer(request.user).data)


# --- Token-based auth for the React Native client -------------------------
# Native apps have no cookie jar / CSRF story the way a browser does, so
# they authenticate with a bearer token instead of a session cookie. These
# views are intentionally separate from the session-based ones above (used
# by the web frontend) rather than csrf_exempt versions of them, so the
# web flow's CSRF protection is never weakened to accommodate mobile.

class TokenRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        form = RegistrationForm(request.data)
        if form.is_valid():
            user = form.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {'token': token.key, 'user': UserSerializer(user).data},
                status=status.HTTP_201_CREATED,
            )
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class TokenLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        form = LoginForm(data=request.data)
        if form.is_valid():
            user = form.get_user()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': UserSerializer(user).data})
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class TokenLogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TokenMeView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
