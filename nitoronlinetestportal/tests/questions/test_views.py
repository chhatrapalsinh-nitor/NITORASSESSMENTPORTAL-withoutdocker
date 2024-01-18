from django.urls import reverse

import pytest


def test_add_question_returns_403(client):
    response = client.get(reverse('add_question'))

    assert response.status_code == 403
    assert response.json() == {
        'error': True,
        'message': 'Request forbidden -- authorization will not help',
        'status': 403,
        'data': {
            'detail': 'Authentication credentials were not provided.'
        }
    }


@pytest.mark.django_db
def test_add_question_returns_405(client, test_user):
    client.login(username=test_user.username, password='test_password')
    response = client.get(reverse('add_question'))

    assert response.status_code == 405
    assert response.json() == {
        'error': True,
        'message': 'Specified method is invalid for this resource',
        'status': 405,
        'data': {
            'detail': 'Method "GET" not allowed.'
        }
    }


@pytest.mark.parametrize('data, expected_message', [
    ('', 'request data must be non-emtpy object'),
    (None, 'request data must be non-emtpy object'),
    ([], 'request data must be non-emtpy object'),
    ({}, 'request data must be non-emtpy object'),
    ({'test': 'test'}, 'request body must be non-emtpy object'),
    ({'values': ''}, 'request body must be non-emtpy object'),
    ({'values': None}, 'request body must be non-emtpy object'),
    ({'values': []}, 'request body must be non-emtpy object'),
    ({'values': {}}, 'request body must be non-emtpy object'),
    ({'values': {'test': 'test'}}, 'either multiple_options or program_test_cases must be present'),
    ({'values': {'multiple_options': ''}}, 'either multiple_options or program_test_cases must be present'),
    ({'values': {'multiple_options': None}}, 'either multiple_options or program_test_cases must be present'),
    ({'values': {'multiple_options': []}}, 'either multiple_options or program_test_cases must be present'),
    ({'values': {'multiple_options': {}}}, 'either multiple_options or program_test_cases must be present'),
    ({'values': {'multiple_options': 'test'}}, 'multiple_options or program_test_cases must be dictionary'),
    ({'values': {'multiple_options': ['1']}}, 'multiple_options or program_test_cases must be dictionary'),
])
@pytest.mark.django_db
def test_add_question_returns_400(client, login_user, data, expected_message):
    response = client.post(reverse('add_question'), data=data, content_type='application/json')

    assert response.status_code == 400
    assert response.json() == {
        'error': True,
        'message': expected_message,
        'status': 400,
        'data': []
    }
