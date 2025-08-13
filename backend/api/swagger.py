from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Emelmujiro API",
        default_version='v1',
        description="""
        # Emelmujiro API Documentation

        ## Overview
        AI 교육 및 컨설팅 전문 기업 에멜무지로의 REST API입니다.

        ## Authentication
        이 API는 JWT (JSON Web Token) 인증을 사용합니다.

        ### 인증 과정:
        1. `/api/auth/register/` 또는 `/api/auth/login/`을 통해 토큰을 받습니다.
        2. 받은 `access` 토큰을 헤더에 포함시킵니다: `Authorization: Bearer <access_token>`
        3. `access` 토큰이 만료되면 `refresh` 토큰으로 새 토큰을 받습니다.

        ## Rate Limiting
        - 인증된 사용자: 1000 requests/hour
        - 비인증 사용자: 100 requests/hour

        ## Response Format
        모든 응답은 JSON 형식입니다.

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
        contact=openapi.Contact(
            name="Emelmujiro Support",
            email="researcherhojin@gmail.com",
            url="https://emelmujiro.com"
        ),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
    authentication_classes=[],
)

# Custom parameters for common use
auth_header = openapi.Parameter(
    'Authorization',
    openapi.IN_HEADER,
    description="JWT Token (Bearer <token>)",
    type=openapi.TYPE_STRING,
    required=True
)

page_param = openapi.Parameter(
    'page',
    openapi.IN_QUERY,
    description="Page number",
    type=openapi.TYPE_INTEGER,
    default=1
)

page_size_param = openapi.Parameter(
    'page_size',
    openapi.IN_QUERY,
    description="Number of items per page",
    type=openapi.TYPE_INTEGER,
    default=10
)

search_param = openapi.Parameter(
    'search',
    openapi.IN_QUERY,
    description="Search query",
    type=openapi.TYPE_STRING
)

category_param = openapi.Parameter(
    'category',
    openapi.IN_QUERY,
    description="Category filter",
    type=openapi.TYPE_STRING
)
