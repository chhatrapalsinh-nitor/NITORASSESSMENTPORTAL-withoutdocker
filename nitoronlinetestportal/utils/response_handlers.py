from http import HTTPStatus

from django.http import JsonResponse

from rest_framework import status
from rest_framework.views import exception_handler


def standard_json_response(error=False, message='', status_code=status.HTTP_200_OK, data=[]):
    if str(status_code).startswith(('4', '5')):
        error = True
    return JsonResponse(data={
        'error': error,
        'message': message,
        'status': status_code,
        'data': data,
    }, status=status_code)


def api_exception_handler(exc, context):
    """Custom API exception handler."""

    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        # Using the description's of the HTTPStatus class as error message.
        http_code_to_message = {v.value: v.description for v in HTTPStatus}

        error_payload = {
            "error": True,
            "message": http_code_to_message[response.status_code],
            "status": response.status_code,
            "data": response.data,
        }
        response.data = error_payload

    return response
