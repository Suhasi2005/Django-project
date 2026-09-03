from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

from .models import User


class AuthAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='shopper', password='pass12345')

    def test_me_requires_login(self):
        response = self.client.get(reverse('api-me'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_and_me(self):
        response = self.client.post(reverse('api-login'), {
            'username': 'shopper', 'password': 'pass12345',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'shopper')

        me = self.client.get(reverse('api-me'))
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data['username'], 'shopper')

    def test_login_rejects_wrong_password(self):
        response = self.client.post(reverse('api-login'), {
            'username': 'shopper', 'password': 'wrong-password',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_creates_user_and_logs_in(self):
        response = self.client.post(reverse('api-register'), {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'a-strong-pass123',
            'password2': 'a-strong-pass123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

        me = self.client.get(reverse('api-me'))
        self.assertEqual(me.data['username'], 'newuser')

    def test_logout_clears_session(self):
        self.client.post(reverse('api-login'), {'username': 'shopper', 'password': 'pass12345'})
        self.client.post(reverse('api-logout'))
        me = self.client.get(reverse('api-me'))
        self.assertEqual(me.status_code, status.HTTP_401_UNAUTHORIZED)


class CSRFEnforcementTests(APITestCase):
    """
    Simulates what a real browser does: fetch the CSRF cookie first, then
    send it back as a header on state-changing requests. This is the part
    that silently breaks if the frontend and backend disagree on CORS/CSRF
    config, so it's tested with CSRF checks actually turned on.
    """

    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        User.objects.create_user(username='shopper', password='pass12345')

    def test_login_without_csrf_token_is_rejected(self):
        response = self.client.post(reverse('api-login'), {
            'username': 'shopper', 'password': 'pass12345',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_with_csrf_token_succeeds(self):
        csrf_response = self.client.get(reverse('api-csrf'))
        token = csrf_response.data['csrfToken']

        response = self.client.post(
            reverse('api-login'),
            {'username': 'shopper', 'password': 'pass12345'},
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TokenAuthAPITests(APITestCase):
    """
    The React Native client has no cookie jar, so it uses these
    token-based endpoints instead of the session ones above. Crucially,
    they must work with NO CSRF token at all (enforce_csrf_checks=True
    proves that), since a mobile app has no CSRF cookie to read.
    """

    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.user = User.objects.create_user(username='shopper', password='pass12345')

    def test_token_login_without_csrf_succeeds(self):
        response = self.client.post(reverse('api-token-login'), {
            'username': 'shopper', 'password': 'pass12345',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'shopper')
        self.assertTrue(Token.objects.filter(key=response.data['token'], user=self.user).exists())

    def test_token_register_without_csrf_succeeds(self):
        response = self.client.post(reverse('api-token-register'), {
            'username': 'newmobileuser',
            'email': 'mobile@example.com',
            'password1': 'a-strong-pass123',
            'password2': 'a-strong-pass123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(username='newmobileuser').exists())

    def test_token_authenticates_subsequent_requests(self):
        login = self.client.post(reverse('api-token-login'), {
            'username': 'shopper', 'password': 'pass12345',
        })
        token = login.data['token']

        me = self.client.get(reverse('api-token-me'), HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data['username'], 'shopper')

    def test_token_me_rejects_missing_token(self):
        response = self.client.get(reverse('api-token-me'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_logout_invalidates_token(self):
        login = self.client.post(reverse('api-token-login'), {
            'username': 'shopper', 'password': 'pass12345',
        })
        token = login.data['token']

        logout = self.client.post(reverse('api-token-logout'), HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)

        me = self.client.get(reverse('api-token-me'), HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(me.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_product_api_accepts_token_auth(self):
        """The same cart/checkout endpoints the web app uses must also work for mobile."""
        login = self.client.post(reverse('api-token-login'), {
            'username': 'shopper', 'password': 'pass12345',
        })
        token = login.data['token']

        response = self.client.get(reverse('api-cart'), HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
