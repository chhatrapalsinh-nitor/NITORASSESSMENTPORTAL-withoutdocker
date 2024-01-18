from django.contrib.auth.models import User

import pytest


@pytest.fixture
def test_user():
    return User.objects.create_user('test_user', 'test@user.com', 'test_password')


@pytest.fixture
def login_user(client):
    user = User.objects.create_user('test_user1', 'test1@user.com', 'test_password1')
    client.login(username=user.username, password='test_password1')
