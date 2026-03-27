import os

from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "contact@emelmujiro.com")

schema_view = get_schema_view(
    openapi.Info(
        title="Emelmujiro API",
        default_version="v1",
        description="""
        # Emelmujiro API Documentation

        ## Overview
        REST API for Emelmujiro, an AI education and consulting company.

        ## Authentication
        This API uses JWT (JSON Web Token) authentication.

        ### Authentication Flow:
        1. Obtain tokens via `/api/auth/register/` or `/api/auth/login/`.
        2. Include the `access` token in the header: `Authorization: Bearer <access_token>`
        3. When the `access` token expires, use the `refresh` token to obtain a new one.

        ## Rate Limiting
        - Authenticated users: 1000 requests/hour
        - Unauthenticated users: 100 requests/hour

        ## Response Format
        All responses are in JSON format.

        ### Success Response
        ```json
        {
            "data": {...},
            "message": "Success"
        }
        ```

        ### Error Response
        ```json
        {
            "error": "Error message",
            "detail": "Detailed error information"
        }
        ```
        """,
        terms_of_service="https://emelmujiro.com/terms/",
        contact=openapi.Contact(name="Emelmujiro Support", email=CONTACT_EMAIL, url="https://emelmujiro.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
    authentication_classes=[],
)
