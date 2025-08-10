from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import BlogPost, Contact, NewsletterSubscription
from datetime import datetime, timezone
from typing import cast


class BlogPostAPITestCase(APITestCase):
    """Tests for BlogPost API endpoints"""

    def setUp(self):
        self.blog_post = BlogPost.objects.create(
            title="Test Blog Post",
            description="Test description",
            content="Test content",
            category="ai_development",
            date=datetime.now(timezone.utc),
            image_url="https://example.com/image.jpg",
            is_featured=True,
            view_count=0,
        )

    def test_list_blog_posts(self):
        """Test listing all blog posts"""
        url = reverse("blog-list")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_retrieve_blog_post(self):
        """Test retrieving a single blog post"""
        url = reverse("blog-detail", kwargs={"pk": self.blog_post.pk})
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Blog Post")

    def test_filter_blog_posts_by_category(self):
        """Test filtering blog posts by category"""
        url = reverse("blog-list")
        response: Response = self.client.get(url, {"category": "ai_development"})  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_featured_blog_posts(self):
        """Test filtering featured blog posts"""
        url = reverse("blog-list")
        response: Response = self.client.get(url, {"is_featured": "true"})  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)


class ContactAPITestCase(APITestCase):
    """Tests for Contact API endpoints"""

    def test_create_contact(self):
        """Test creating a new contact"""
        url = reverse("contact-create")
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "company": "Test Company",
            "phone": "010-1234-5678",
            "inquiry_type": "general",
            "subject": "Test Subject",
            "message": "This is a test message with sufficient length.",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Contact.objects.count(), 1)
        self.assertEqual(Contact.objects.first().name, "Test User")

    def test_invalid_email_contact(self):
        """Test contact creation with invalid email"""
        url = reverse("contact-create")
        data = {
            "name": "Test User",
            "email": "invalid-email",
            "subject": "Test Subject",
            "message": "This is a test message with sufficient length.",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("details", response.data)
        self.assertIn("email", response.data["details"])

    def test_short_message_contact(self):
        """Test contact creation with too short message"""
        url = reverse("contact-create")
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "Short",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("details", response.data)
        self.assertIn("message", response.data["details"])


class NewsletterAPITestCase(APITestCase):
    """Tests for Newsletter Subscription API endpoints"""

    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        url = reverse("newsletter-subscribe")
        data = {"email": "subscriber@example.com", "name": "Test Subscriber"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(NewsletterSubscription.objects.count(), 1)

    def test_duplicate_newsletter_subscription(self):
        """Test duplicate newsletter subscription"""
        NewsletterSubscription.objects.create(
            email="subscriber@example.com", name="First Subscriber"
        )
        url = reverse("newsletter-subscribe")
        data = {"email": "subscriber@example.com", "name": "Second Subscriber"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthenticationAPITestCase(APITestCase):
    """Tests for Authentication API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_user_registration(self):
        """Test user registration"""
        url = reverse("register")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpass123",
            "password_confirm": "newpass123",
            "first_name": "New",
            "last_name": "User",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_user_login(self):
        """Test user login"""
        url = reverse("login")
        data = {"username": "testuser", "password": "testpass123"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        url = reverse("login")
        data = {"username": "testuser", "password": "wrongpassword"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_mismatch_registration(self):
        """Test registration with password mismatch"""
        url = reverse("register")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpass123",
            "password_confirm": "differentpass123",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)


class HealthCheckAPITestCase(APITestCase):
    """Tests for Health Check API endpoint"""

    def test_health_check(self):
        """Test health check endpoint"""
        url = reverse("health-check")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "healthy")
        self.assertIn("timestamp", response.data)
