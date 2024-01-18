from unittest.mock import patch

from django.contrib.auth.models import User
from django.urls import reverse

import pytest

from login_home.serializers import UserSerializer
from utils.response_handlers import standard_json_response


def test_home(client):
    response = client.get(reverse('home'))

    assert response.status_code == 200
    assert 'index.html' in (t.name for t in response.templates)


def test_login_api_returns_405(client):
    response = client.get(reverse('login'))

    assert response.status_code == 405


def test_login_api_returns_403(client):
    response = client.post(reverse('login'))

    assert response.status_code == 403
    assert response.json() == {
        'error': True,
        'message': 'Authentication credentials were not provided',
        'status': 403,
        'data': []
    }


@patch('login_home.views.base64.b64decode')
@pytest.mark.django_db
def test_login_api_returns_401(mock_b64decode, client):
    mock_b64decode.return_value = b'invalid_user:invalid_password'

    response = client.post(reverse('login'), HTTP_AUTHORIZATION='Basic b64_encoded_token')

    assert response.status_code == 401
    assert response.json() == {
        'error': True,
        'message': 'Invalid username/password',
        'status': 401,
        'data': []
    }


@patch('login_home.views.base64.b64decode')
@pytest.mark.django_db
def test_login_api_returns_200(mock_b64decode, client, test_user):
    mock_b64decode.return_value = b'test_user:test_password'

    response = client.post(reverse('login'), HTTP_AUTHORIZATION='Basic token1')

    user_from_db = User.objects.get(username=test_user.username)
    expected_response = standard_json_response(data=UserSerializer(instance=user_from_db).data, message='Login successful')
    assert response.status_code == expected_response.status_code
    assert response.content == expected_response.content


def test_logout_view_logsout_anonymous_user(client):
    response = client.post(reverse('logout'))

    expected_response = standard_json_response(message='Logout successful')
    assert response.status_code == expected_response.status_code
    assert response.content == expected_response.content


@pytest.mark.django_db
def test_logout_view_logsout_loggedin_user(client, test_user):
    login_status = client.login(username=test_user, password='test_password')

    response = client.post(reverse('logout'))

    expected_response = standard_json_response(message='Logout successful')
    assert login_status is True
    assert response.status_code == expected_response.status_code
    assert response.content == expected_response.content
