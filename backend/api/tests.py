from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import BlogPost, Contact, ContactAttempt, SiteVisit, NewsletterSubscription
from .views import get_client_ip, _is_valid_ip
from datetime import datetime, timezone, timedelta
from django.utils import timezone as django_timezone
from typing import cast, Any, Dict

# Disable throttling for all tests to avoid rate-limit interference
NO_THROTTLE = {
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {},
}


class BlogPostAPITestCase(APITestCase):
    """Tests for BlogPost API endpoints"""

    def setUp(self):
        self.blog_post = BlogPost.objects.create(
            title="Test Blog Post",
            description="Test description",
            content="Test content",
            category="ai",
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
        assert response.data is not None
        self.assertEqual(len(response.data["results"]), 1)

    def test_retrieve_blog_post(self):
        """Test retrieving a single blog post"""
        url = reverse("blog-detail", kwargs={"pk": self.blog_post.pk})
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(response.data["title"], "Test Blog Post")

    def test_filter_blog_posts_by_category(self):
        """Test filtering blog posts by category"""
        url = reverse("blog-list")
        response: Response = self.client.get(url, {"category": "ai"})  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data["results"]), 1)

    def test_featured_blog_posts(self):
        """Test filtering featured blog posts"""
        url = reverse("blog-list")
        response: Response = self.client.get(url, {"featured": "true"})  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data["results"]), 1)

    def test_search_blog_posts(self):
        """Test searching blog posts by query"""
        url = reverse("blog-list")
        response: Response = self.client.get(url, {"search": "Test"})  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data["results"]), 1)

    def test_search_no_results(self):
        """Test search with no matching results"""
        url = reverse("blog-list")
        response: Response = self.client.get(url, {"search": "nonexistent"})  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data["results"]), 0)

    def test_filter_invalid_category(self):
        """Test filtering by invalid category returns all posts"""
        url = reverse("blog-list")
        response: Response = self.client.get(url, {"category": "invalid"})  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        # Invalid category is ignored, returns all
        self.assertEqual(len(response.data["results"]), 1)

    def test_unpublished_posts_hidden(self):
        """Test that unpublished posts are not listed"""
        BlogPost.objects.create(
            title="Draft Post",
            description="Draft",
            content="Draft content",
            category="ai",
            is_published=False,
        )
        url = reverse("blog-list")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data["results"]), 1)  # Only published post

    def test_retrieve_increments_view_count(self):
        """Test that retrieving a post increments view count"""
        from django.core.cache import cache

        cache.clear()  # Ensure no cached view keys
        url = reverse("blog-detail", kwargs={"pk": self.blog_post.pk})
        self.client.get(url, REMOTE_ADDR="203.0.113.1")  # type: ignore
        self.blog_post.refresh_from_db()
        self.assertEqual(self.blog_post.view_count, 1)

    def test_retrieve_nonexistent_post(self):
        """Test retrieving a post that doesn't exist"""
        url = reverse("blog-detail", kwargs={"pk": 99999})
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class BlogPostModelTestCase(TestCase):
    """Tests for BlogPost model"""

    def test_slug_auto_generation(self):
        """Test that slug is auto-generated from title"""
        post = BlogPost.objects.create(
            title="My Test Post",
            description="Desc",
            content="Content",
            category="ai",
        )
        self.assertTrue(len(post.slug) > 0)

    def test_slug_uniqueness(self):
        """Test that duplicate titles produce unique slugs"""
        post1 = BlogPost.objects.create(
            title="Same Title",
            description="Desc 1",
            content="Content 1",
            category="ai",
        )
        post2 = BlogPost.objects.create(
            title="Same Title",
            description="Desc 2",
            content="Content 2",
            category="ai",
        )
        self.assertNotEqual(post1.slug, post2.slug)

    def test_str_representation(self):
        """Test __str__ returns title"""
        post = BlogPost.objects.create(
            title="Test Title",
            description="Desc",
            content="Content",
            category="ai",
        )
        self.assertEqual(str(post), "Test Title")

    def test_default_ordering(self):
        """Test posts are ordered by -date by default"""
        BlogPost.objects.create(
            title="Old Post",
            description="D",
            content="C",
            category="ai",
            date=django_timezone.now() - timedelta(days=10),
        )
        BlogPost.objects.create(
            title="New Post",
            description="D",
            content="C",
            category="ai",
            date=django_timezone.now(),
        )
        posts = list(BlogPost.objects.all())
        self.assertEqual(posts[0].title, "New Post")
        self.assertEqual(posts[1].title, "Old Post")


class ContactModelTestCase(TestCase):
    """Tests for Contact and ContactAttempt models"""

    def test_contact_str(self):
        """Test Contact __str__"""
        contact = Contact.objects.create(
            name="Test User",
            email="test@example.com",
            subject="Test Subject",
            message="Test message content here.",
        )
        self.assertIn("Test User", str(contact))
        self.assertIn("Test Subject", str(contact))

    def test_contact_attempt_str(self):
        """Test ContactAttempt __str__"""
        attempt = ContactAttempt.objects.create(
            ip_address="192.168.1.1",
            email="test@example.com",
            attempt_count=3,
        )
        self.assertIn("192.168.1.1", str(attempt))
        self.assertIn("3", str(attempt))


class SiteVisitModelTestCase(TestCase):
    """Tests for SiteVisit model"""

    def test_site_visit_str(self):
        """Test SiteVisit __str__"""
        visit = SiteVisit.objects.create(
            ip_address="10.0.0.1",
            user_agent="TestAgent/1.0",
            page_path="/test",
        )
        self.assertIn("10.0.0.1", str(visit))
        self.assertIn("/test", str(visit))


class NewsletterSubscriptionModelTestCase(TestCase):
    """Tests for NewsletterSubscription model"""

    def test_active_subscription_str(self):
        """Test active subscription __str__"""
        sub = NewsletterSubscription.objects.create(
            email="test@example.com",
            name="Test",
        )
        result = str(sub)
        self.assertIn("test@example.com", result)
        self.assertIn("활성", result)

    def test_inactive_subscription_str(self):
        """Test inactive subscription __str__"""
        sub = NewsletterSubscription.objects.create(
            email="test@example.com",
            name="Test",
            is_active=False,
        )
        result = str(sub)
        self.assertIn("비활성", result)


@override_settings(
    REST_FRAMEWORK={
        "DEFAULT_THROTTLE_CLASSES": [],
        "DEFAULT_THROTTLE_RATES": {"anon": None, "user": None, "contact": None, "newsletter": None},
    }
)
class ContactAPITestCase(APITestCase):
    """Tests for Contact API endpoints"""

    def setUp(self):
        from django.core.cache import cache

        cache.clear()  # Reset throttle counters between tests

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
        contact = Contact.objects.first()
        assert contact is not None
        self.assertEqual(contact.name, "Test User")

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
        assert response.data is not None
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
        assert response.data is not None
        self.assertIn("details", response.data)
        self.assertIn("message", response.data["details"])

    def test_missing_required_fields(self):
        """Test contact creation with missing required fields"""
        url = reverse("contact-create")
        data = {"name": "Test User"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_name_rejected(self):
        """Test contact with single-character name is rejected"""
        url = reverse("contact-create")
        data = {
            "name": "A",
            "email": "test@example.com",
            "subject": "Test Subject Here",
            "message": "This is a test message with sufficient length.",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_subject_rejected(self):
        """Test contact with short subject is rejected"""
        url = reverse("contact-create")
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Hi",
            "message": "This is a test message with sufficient length.",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_spam_message_rejected(self):
        """Test contact with spam keywords is rejected"""
        url = reverse("contact-create")
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject Here",
            "message": "대출 상품 투자 수익을 보장합니다. 지금 바로 확인하세요.",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_tempmail_domain_rejected(self):
        """Test contact with temporary email domain is rejected"""
        url = reverse("contact-create")
        data = {
            "name": "Test User",
            "email": "test@tempmail.org",
            "subject": "Test Subject Here",
            "message": "This is a valid test message content.",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_phone_rejected(self):
        """Test contact with invalid phone format is rejected"""
        url = reverse("contact-create")
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "123-abc-defg",
            "subject": "Test Subject Here",
            "message": "This is a valid test message content.",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    REST_FRAMEWORK={
        "DEFAULT_THROTTLE_CLASSES": [],
        "DEFAULT_THROTTLE_RATES": {"anon": None, "user": None, "contact": None, "newsletter": None},
    }
)
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
        """Test duplicate newsletter subscription returns 200 (already subscribed)"""
        NewsletterSubscription.objects.create(email="subscriber@example.com", name="First Subscriber")
        url = reverse("newsletter-subscribe")
        data = {"email": "subscriber@example.com", "name": "Second Subscriber"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        # View's resubscription logic handles duplicates gracefully
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(NewsletterSubscription.objects.count(), 1)

    def test_resubscribe_inactive_newsletter(self):
        """Test resubscribing an inactive newsletter subscription reactivates it"""
        sub = NewsletterSubscription.objects.create(email="inactive@example.com", name="Inactive", is_active=False)
        url = reverse("newsletter-subscribe")
        data = {"email": "inactive@example.com", "name": "Resubscriber"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        sub.refresh_from_db()
        self.assertTrue(sub.is_active)

    def test_invalid_email_newsletter(self):
        """Test newsletter with invalid email"""
        url = reverse("newsletter-subscribe")
        data = {"email": "not-an-email", "name": "Test"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_newsletter_email_normalized(self):
        """Test that newsletter email is lowercased"""
        url = reverse("newsletter-subscribe")
        data = {"email": "TEST@Example.COM", "name": "Test"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        sub = NewsletterSubscription.objects.first()
        assert sub is not None
        self.assertEqual(sub.email, "test@example.com")


class AuthenticationAPITestCase(APITestCase):
    """Tests for Authentication API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass12345")

    def test_user_registration(self):
        """Test user registration"""
        url = reverse("register")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpass123456",
            "password_confirm": "newpass123456",
            "first_name": "New",
            "last_name": "User",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        assert response.data is not None
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)

    def test_user_login(self):
        """Test user login"""
        url = reverse("login")
        data = {"username": "testuser", "password": "testpass12345"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_email(self):
        """Test login using email instead of username"""
        url = reverse("login")
        data = {"username": "test@example.com", "password": "testpass12345"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertIn("access", response.data)

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        url = reverse("login")
        data = {"username": "testuser", "password": "wrongpassword"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_email(self):
        """Test login with non-existent email"""
        url = reverse("login")
        data = {"username": "nobody@example.com", "password": "testpass12345"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        """Test login with missing fields"""
        url = reverse("login")
        data = {"username": "testuser"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_mismatch_registration(self):
        """Test registration with password mismatch"""
        url = reverse("register")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpass123456",
            "password_confirm": "differentpass123",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        assert response.data is not None
        self.assertIn("error", response.data)

    def test_short_password_registration(self):
        """Test registration with password shorter than 12 characters"""
        url = reverse("register")
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "short123",
            "password_confirm": "short123",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        assert response.data is not None
        self.assertIn("12", response.data["error"])

    def test_duplicate_username_registration(self):
        """Test registration with existing username"""
        url = reverse("register")
        data = {
            "username": "testuser",
            "email": "another@example.com",
            "password": "newpass123456",
            "password_confirm": "newpass123456",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_registration(self):
        """Test registration with existing email"""
        url = reverse("register")
        data = {
            "username": "anotheruser",
            "email": "test@example.com",
            "password": "newpass123456",
            "password_confirm": "newpass123456",
        }
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_fields_registration(self):
        """Test registration with missing required fields"""
        url = reverse("register")
        data = {"username": "newuser"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_authenticated(self):
        """Test getting user info when authenticated"""
        self.client.force_authenticate(user=self.user)
        url = reverse("get_user")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["email"], "test@example.com")

    def test_get_user_unauthenticated(self):
        """Test getting user info when not authenticated"""
        url = reverse("get_user")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_user(self):
        """Test updating user info"""
        self.client.force_authenticate(user=self.user)
        url = reverse("update_user")
        data = {"first_name": "Updated", "last_name": "Name"}
        response: Response = self.client.put(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.user.last_name, "Name")

    def test_update_user_email(self):
        """Test updating user email"""
        self.client.force_authenticate(user=self.user)
        url = reverse("update_user")
        data = {"email": "newemail@example.com"}
        response: Response = self.client.put(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "newemail@example.com")

    def test_update_user_duplicate_email(self):
        """Test updating to an email already in use"""
        User.objects.create_user(username="other", email="taken@example.com", password="testpass12345")
        self.client.force_authenticate(user=self.user)
        url = reverse("update_user")
        data = {"email": "taken@example.com"}
        response: Response = self.client.put(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_user_unauthenticated(self):
        """Test updating user info when not authenticated"""
        url = reverse("update_user")
        data = {"first_name": "Hacker"}
        response: Response = self.client.put(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password(self):
        """Test changing password"""
        self.client.force_authenticate(user=self.user)
        url = reverse("change_password")
        data = {"old_password": "testpass12345", "new_password": "brandnewpass12"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("brandnewpass12"))

    def test_change_password_wrong_old(self):
        """Test changing password with wrong old password"""
        self.client.force_authenticate(user=self.user)
        url = reverse("change_password")
        data = {"old_password": "wrongoldpass", "new_password": "brandnewpass12"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_too_short(self):
        """Test changing password to a short one"""
        self.client.force_authenticate(user=self.user)
        url = reverse("change_password")
        data = {"old_password": "testpass12345", "new_password": "short"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        assert response.data is not None
        self.assertIn("12", response.data["error"])

    def test_change_password_missing_fields(self):
        """Test changing password with missing fields"""
        self.client.force_authenticate(user=self.user)
        url = reverse("change_password")
        data = {"old_password": "testpass12345"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_success(self):
        """Test successful logout blacklists the refresh token"""
        self.client.force_authenticate(user=self.user)
        refresh = RefreshToken.for_user(self.user)
        url = reverse("logout")
        data = {"refresh": str(refresh)}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_invalid_token(self):
        """Test logout with invalid refresh token returns 400"""
        self.client.force_authenticate(user=self.user)
        url = reverse("logout")
        data = {"refresh": "invalid-token"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_missing_token(self):
        """Test logout without refresh token"""
        self.client.force_authenticate(user=self.user)
        url = reverse("logout")
        data = {}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_unauthenticated(self):
        """Test logout when not authenticated"""
        url = reverse("logout")
        data = {"refresh": "fake-token"}
        response: Response = self.client.post(url, data, format="json")  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CategoryListAPITestCase(APITestCase):
    """Tests for Category List API endpoint"""

    def test_category_list(self):
        """Test listing categories with post counts"""
        BlogPost.objects.create(
            title="AI Post",
            description="D",
            content="C",
            category="ai",
        )
        BlogPost.objects.create(
            title="ML Post",
            description="D",
            content="C",
            category="ml",
        )
        url = reverse("category-list")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data), 2)
        # Each category should have id, name, slug, count
        for cat in response.data:
            self.assertIn("id", cat)
            self.assertIn("name", cat)
            self.assertIn("slug", cat)
            self.assertIn("count", cat)

    def test_category_list_empty(self):
        """Test category list with no posts"""
        url = reverse("category-list")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data), 0)

    def test_category_excludes_unpublished(self):
        """Test that categories from unpublished posts are excluded"""
        BlogPost.objects.create(
            title="Hidden Post",
            description="D",
            content="C",
            category="cv",
            is_published=False,
        )
        url = reverse("category-list")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(len(response.data), 0)


class HealthCheckAPITestCase(APITestCase):
    """Tests for Health Check API endpoint"""

    def test_health_check(self):
        """Test health check endpoint"""
        url = reverse("health-check")
        response: Response = self.client.get(url)  # type: ignore
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assert response.data is not None
        self.assertEqual(response.data["status"], "healthy")
        self.assertIn("timestamp", response.data)


class UtilityFunctionTestCase(TestCase):
    """Tests for utility functions in views"""

    def setUp(self):
        self.factory = RequestFactory()

    def test_get_client_ip_direct(self):
        """Test get_client_ip with REMOTE_ADDR"""
        request = self.factory.get("/")
        request.META["REMOTE_ADDR"] = "192.168.1.100"
        ip = get_client_ip(request)
        self.assertEqual(ip, "192.168.1.100")

    def test_get_client_ip_x_forwarded_for(self):
        """Test get_client_ip with X-Forwarded-For header"""
        request = self.factory.get("/")
        request.META["HTTP_X_FORWARDED_FOR"] = "10.0.0.1, 10.0.0.2"
        ip = get_client_ip(request)
        self.assertEqual(ip, "10.0.0.1")

    def test_get_client_ip_cloudflare(self):
        """Test get_client_ip with Cloudflare header"""
        request = self.factory.get("/")
        request.META["HTTP_CF_CONNECTING_IP"] = "203.0.113.50"
        ip = get_client_ip(request)
        self.assertEqual(ip, "203.0.113.50")

    def test_get_client_ip_fallback(self):
        """Test get_client_ip fallback to 127.0.0.1"""
        request = self.factory.get("/")
        # Remove REMOTE_ADDR
        request.META.pop("REMOTE_ADDR", None)
        ip = get_client_ip(request)
        self.assertEqual(ip, "127.0.0.1")

    def test_is_valid_ip_v4(self):
        """Test valid IPv4 addresses"""
        self.assertTrue(_is_valid_ip("192.168.1.1"))
        self.assertTrue(_is_valid_ip("10.0.0.1"))
        self.assertTrue(_is_valid_ip("255.255.255.255"))
        self.assertTrue(_is_valid_ip("0.0.0.0"))

    def test_is_valid_ip_invalid(self):
        """Test invalid IP addresses"""
        self.assertFalse(_is_valid_ip("999.999.999.999"))
        self.assertFalse(_is_valid_ip("not-an-ip"))
        self.assertFalse(_is_valid_ip(""))
        self.assertFalse(_is_valid_ip("192.168.1"))

    def test_is_valid_ip_v6(self):
        """Test valid IPv6 address"""
        self.assertTrue(_is_valid_ip("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
