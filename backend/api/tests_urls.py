# URL configuration for tests that need the send-test-email endpoint
# (which is normally only registered in DEBUG mode)
from django.urls import path
from api.views import send_test_email

urlpatterns = [
    path("send-test-email/", send_test_email, name="send-test-email"),
]
