from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_response(data=None, message="OK", success=True, status_code=200, pagination=None):
    payload = {
        "success": success,
        "message": message,
        "data": data,
    }
    if pagination is not None:
        payload["pagination"] = pagination
    return Response(payload, status=status_code)


class ApiResponseMixin:
    success_message = "Request completed successfully."

    def finalize_response(self, request, response, *args, **kwargs):
        if isinstance(response, Response) and not getattr(response, "_is_rendered", False):
            data = response.data
            if isinstance(data, dict) and {"success", "message", "data"}.issubset(data.keys()):
                return super().finalize_response(request, response, *args, **kwargs)
            if response.status_code < 400:
                response.data = {
                    "success": True,
                    "message": self.success_message,
                    "data": data,
                }
        return super().finalize_response(request, response, *args, **kwargs)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    message = "Request failed."
    if isinstance(response.data, dict):
        message = response.data.get("detail", message)
    response.data = {
        "success": False,
        "message": str(message),
        "data": response.data,
    }
    return response
