import base64

from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from rest_framework import status

from login_home.serializers import UserSerializer
from utils.response_handlers import standard_json_response


def home(request):
    return render(request, 'index.html')


@require_http_methods(["POST"])
@csrf_exempt
def login_api(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return standard_json_response(message='Authentication credentials were not provided', status_code=status.HTTP_403_FORBIDDEN)

    encoded_credentials = auth_header.split(' ')[1]     # Removes "Basic " to isolate credentials
    decoded_credentials = base64.b64decode(encoded_credentials).decode("utf-8").split(':')
    username = decoded_credentials[0]
    password = decoded_credentials[1]
    user = authenticate(username=username, password=password)

    if user:
        login(request, user)
        return standard_json_response(data=UserSerializer(instance=user).data, message='Login successful')
    else:
        return standard_json_response(message='Invalid username/password', status_code=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
def logout_view(request):
    logout(request)
    return standard_json_response(message='Logout successful')
