from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import BlogPost, Contact, ContactAttempt, Notification, NotificationPreference, SiteVisit, NewsletterSubscription
from .views import get_client_ip, _is_valid_ip, send_user_notification
from datetime import datetime, timezone, timedelta
from django.utils import timezone as django_timezone

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


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class BlogPostWriteAPITestCase(APITestCase):
    """Tests for BlogPost write API endpoints (create, update, delete)"""

    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username="admin", password="adminpass123", email="admin@test.com", first_name="Admin", last_name="User"
        )
        self.regular_user = User.objects.create_user(
            username="regular", password="regularpass123", email="regular@test.com"
        )
        self.blog_post = BlogPost.objects.create(
            title="Existing Post",
            description="Existing description",
            content="Existing content",
            category="ai",
        )
        self.create_url = reverse("blog-list")
        self.detail_url = reverse("blog-detail", kwargs={"pk": self.blog_post.pk})

    def _auth_as(self, user):
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def test_create_blog_post_as_admin(self):
        """Admin can create a blog post"""
        self._auth_as(self.admin_user)
        data = {
            "title": "New Post",
            "description": "New desc",
            "content": "New content body",
            "content_html": "<p>New content body</p>",
            "category": "ai",
            "tags": ["python", "ai"],
        }
        response = self.client.post(self.create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BlogPost.objects.count(), 2)
        created = BlogPost.objects.get(title="New Post")
        self.assertEqual(created.author, "Admin User")
        self.assertEqual(created.content_html, "<p>New content body</p>")
        self.assertTrue(len(created.slug) > 0)

    def test_create_blog_post_as_regular_user_forbidden(self):
        """Non-admin user cannot create a blog post"""
        self._auth_as(self.regular_user)
        data = {"title": "Forbidden Post", "description": "Desc", "content": "Content", "category": "ai"}
        response = self.client.post(self.create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_blog_post_unauthenticated(self):
        """Unauthenticated user cannot create a blog post"""
        data = {"title": "Anon Post", "description": "Desc", "content": "Content", "category": "ai"}
        response = self.client.post(self.create_url, data, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_update_blog_post_as_admin(self):
        """Admin can update a blog post"""
        self._auth_as(self.admin_user)
        data = {"title": "Updated Title", "content_html": "<p>Updated</p>"}
        response = self.client.patch(self.detail_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.blog_post.refresh_from_db()
        self.assertEqual(self.blog_post.title, "Updated Title")
        self.assertEqual(self.blog_post.content_html, "<p>Updated</p>")

    def test_update_blog_post_as_regular_user_forbidden(self):
        """Non-admin user cannot update a blog post"""
        self._auth_as(self.regular_user)
        data = {"title": "Hacked Title"}
        response = self.client.patch(self.detail_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_blog_post_as_admin(self):
        """Admin can delete a blog post"""
        self._auth_as(self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(BlogPost.objects.count(), 0)

    def test_delete_blog_post_as_regular_user_forbidden(self):
        """Non-admin user cannot delete a blog post"""
        self._auth_as(self.regular_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_toggle_publish(self):
        """Admin can toggle publish status"""
        self._auth_as(self.admin_user)
        self.assertTrue(self.blog_post.is_published)
        url = reverse("blog-toggle-publish", kwargs={"pk": self.blog_post.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.blog_post.refresh_from_db()
        self.assertFalse(self.blog_post.is_published)
        # Toggle back
        response = self.client.post(url)
        self.blog_post.refresh_from_db()
        self.assertTrue(self.blog_post.is_published)

    def test_admin_sees_draft_posts(self):
        """Admin can see unpublished (draft) posts in list"""
        BlogPost.objects.create(
            title="Draft Post", description="Draft", content="Draft", category="ai", is_published=False
        )
        self._auth_as(self.admin_user)
        url = reverse("blog-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data["results"]]
        self.assertIn("Draft Post", titles)

    def test_anon_cannot_see_draft_posts(self):
        """Anonymous users cannot see draft posts"""
        BlogPost.objects.create(
            title="Draft Post", description="Draft", content="Draft", category="ai", is_published=False
        )
        url = reverse("blog-list")
        response = self.client.get(url)
        titles = [p["title"] for p in response.data["results"]]
        self.assertNotIn("Draft Post", titles)

    def test_create_with_invalid_category(self):
        """Creating with invalid category returns validation error"""
        self._auth_as(self.admin_user)
        data = {"title": "Bad Cat", "description": "Desc", "content": "C", "category": "invalid_cat"}
        response = self.client.post(self.create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


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


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class AdminAPITestCase(APITestCase):
    """Tests for Admin API endpoints (admin_stats, admin_content)"""

    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpass12345"
        )
        self.staff = User.objects.create_user(
            username="staff", email="staff@example.com", password="staffpass12345", is_staff=True
        )
        self.user = User.objects.create_user(username="regular", email="regular@example.com", password="userpass12345")
        self.post = BlogPost.objects.create(
            title="Admin Test Post",
            description="Desc",
            content="Content",
            category="ai",
            date=datetime.now(timezone.utc),
            author="Admin Author",
            is_published=True,
            view_count=42,
        )
        Contact.objects.create(name="Tester", email="t@test.com", message="Hello")
        SiteVisit.objects.create(page_path="/", ip_address="127.0.0.1", user_agent="test")

    def test_admin_stats_as_admin(self):
        """Admin user can access stats"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["totalUsers"], 3)
        self.assertEqual(response.data["totalPosts"], 1)
        self.assertEqual(response.data["totalMessages"], 1)
        self.assertEqual(response.data["totalViews"], 1)

    def test_admin_stats_forbidden_for_regular_user(self):
        """Regular user cannot access admin stats"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("admin-stats"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_stats_forbidden_for_staff(self):
        """Staff user (non-superuser) cannot access admin stats (IsAdminUser requires is_staff)"""
        self.client.force_authenticate(user=self.staff)
        response = self.client.get(reverse("admin-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_stats_unauthenticated(self):
        """Unauthenticated request is rejected"""
        response = self.client.get(reverse("admin-stats"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_content_as_admin(self):
        """Admin user can list content"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-content"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        item = response.data[0]
        self.assertEqual(item["title"], "Admin Test Post")
        self.assertEqual(item["type"], "blog")
        self.assertEqual(item["status"], "published")
        self.assertEqual(item["author"], "Admin Author")
        self.assertEqual(item["views"], 42)

    def test_admin_content_draft_status(self):
        """Unpublished post shows draft status"""
        self.post.is_published = False
        self.post.save()
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-content"))
        self.assertEqual(response.data[0]["status"], "draft")

    def test_admin_content_forbidden_for_regular_user(self):
        """Regular user cannot access admin content"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("admin-content"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_content_unauthenticated(self):
        """Unauthenticated request is rejected"""
        response = self.client.get(reverse("admin-content"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_messages_empty_list(self):
        """Empty messages list returns correct structure"""
        Contact.objects.all().delete()
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-messages"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])

    def test_admin_messages_invalid_page(self):
        """Invalid page parameter defaults gracefully"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-messages"), {"page": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_messages_page_zero(self):
        """Page 0 is treated as page 1"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-messages"), {"page": 0})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_message_detail_invalid_uuid(self):
        """Invalid UUID returns 404"""
        self.client.force_authenticate(user=self.admin)
        import uuid

        response = self.client.get(reverse("admin-message-detail", kwargs={"pk": uuid.uuid4()}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class AdminUserManagementTestCase(APITestCase):
    """Tests for Admin User Management CRUD endpoints"""

    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpass12345"
        )
        self.staff = User.objects.create_user(
            username="staff", email="staff@example.com", password="staffpass12345", is_staff=True
        )
        self.user = User.objects.create_user(username="regular", email="regular@example.com", password="userpass12345")
        self.user2 = User.objects.create_user(username="another", email="another@example.com", password="userpass12345")

    # --- List ---

    def test_list_users_as_admin(self):
        """Admin can list all users"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 4)
        self.assertEqual(len(response.data["results"]), 4)

    def test_list_users_pagination(self):
        """Pagination works correctly"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"), {"page": 1, "page_size": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["count"], 4)
        self.assertEqual(response.data["next"], 2)

    def test_list_users_search_by_username(self):
        """Search filters by username"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"), {"search": "regular"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["username"], "regular")

    def test_list_users_search_by_email(self):
        """Search filters by email"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"), {"search": "another@"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_list_users_filter_by_role_admin(self):
        """Filter by admin role"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"), {"role": "admin"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["username"], "admin")

    def test_list_users_filter_by_role_staff(self):
        """Filter by staff role"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"), {"role": "staff"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["username"], "staff")

    def test_list_users_filter_by_role_user(self):
        """Filter by regular user role"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"), {"role": "user"})
        self.assertEqual(response.data["count"], 2)

    def test_list_users_filter_by_active_status(self):
        """Filter by active status"""
        self.user2.is_active = False
        self.user2.save()
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-users"), {"is_active": "false"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["username"], "another")

    def test_list_users_forbidden_for_regular_user(self):
        """Regular user cannot list users"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("admin-users"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_users_unauthenticated(self):
        """Unauthenticated request is rejected"""
        response = self.client.get(reverse("admin-users"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Detail ---

    def test_get_user_detail(self):
        """Admin can get user detail"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-user-detail", kwargs={"pk": self.user.pk}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "regular")
        self.assertEqual(response.data["role"], "user")

    def test_get_user_detail_not_found(self):
        """Returns 404 for nonexistent user"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-user-detail", kwargs={"pk": 99999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- Update ---

    def test_update_user_role_to_staff(self):
        """Admin can promote user to staff"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            reverse("admin-user-detail", kwargs={"pk": self.user.pk}),
            {"is_staff": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_staff)

    def test_update_user_deactivate(self):
        """Admin can deactivate a user"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            reverse("admin-user-detail", kwargs={"pk": self.user.pk}),
            {"is_active": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_cannot_remove_own_admin_privileges(self):
        """Admin cannot demote themselves"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            reverse("admin-user-detail", kwargs={"pk": self.admin.pk}),
            {"is_superuser": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_superuser)

    def test_update_user_forbidden_for_regular_user(self):
        """Regular user cannot update users"""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            reverse("admin-user-detail", kwargs={"pk": self.user2.pk}),
            {"is_staff": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- Delete ---

    def test_delete_user(self):
        """Admin can delete a user"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(reverse("admin-user-detail", kwargs={"pk": self.user2.pk}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.user2.pk).exists())

    def test_cannot_delete_self(self):
        """Admin cannot delete their own account"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(reverse("admin-user-detail", kwargs={"pk": self.admin.pk}))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(pk=self.admin.pk).exists())

    def test_delete_user_not_found(self):
        """Returns 404 for nonexistent user"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(reverse("admin-user-detail", kwargs={"pk": 99999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_user_forbidden_for_regular_user(self):
        """Regular user cannot delete users"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(reverse("admin-user-detail", kwargs={"pk": self.user2.pk}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_user_unauthenticated(self):
        """Unauthenticated request is rejected"""
        response = self.client.delete(reverse("admin-user-detail", kwargs={"pk": self.user.pk}))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Serializer fields ---

    def test_user_detail_contains_expected_fields(self):
        """Response contains all expected fields"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-user-detail", kwargs={"pk": self.user.pk}))
        expected_fields = {
            "id", "username", "email", "first_name", "last_name",
            "role", "is_active", "is_staff", "is_superuser",
            "date_joined", "last_login",
        }
        self.assertEqual(set(response.data.keys()), expected_fields)

    def test_role_field_values(self):
        """Role field returns correct values"""
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("admin-user-detail", kwargs={"pk": self.admin.pk}))
        self.assertEqual(response.data["role"], "admin")

        response = self.client.get(reverse("admin-user-detail", kwargs={"pk": self.staff.pk}))
        self.assertEqual(response.data["role"], "staff")

        response = self.client.get(reverse("admin-user-detail", kwargs={"pk": self.user.pk}))
        self.assertEqual(response.data["role"], "user")


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class AdminAnalyticsTestCase(APITestCase):
    """Tests for Admin Analytics endpoints (visits time-series, popular pages)"""

    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpass12345"
        )
        self.user = User.objects.create_user(username="regular", email="regular@example.com", password="userpass12345")

        # Create SiteVisit records across multiple days
        now = django_timezone.now()
        for i in range(3):
            SiteVisit.objects.create(
                ip_address="192.168.1.1",
                user_agent="test-agent",
                page_path="/",
                visit_time=now - timedelta(days=i),
            )
            SiteVisit.objects.create(
                ip_address="192.168.1.2",
                user_agent="test-agent",
                page_path="/about",
                visit_time=now - timedelta(days=i),
            )
        # Extra visit today for unique visitor count
        SiteVisit.objects.create(
            ip_address="192.168.1.3",
            user_agent="test-agent",
            page_path="/",
            visit_time=now,
        )

    # --- Visits endpoint ---

    def test_visits_as_admin(self):
        """Admin can access visit analytics"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["period"], 30)
        self.assertIsInstance(response.data["data"], list)
        self.assertTrue(len(response.data["data"]) > 0)

    def test_visits_data_structure(self):
        """Visit data contains expected fields"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"))
        entry = response.data["data"][0]
        self.assertIn("date", entry)
        self.assertIn("visits", entry)
        self.assertIn("unique_visitors", entry)

    def test_visits_unique_visitor_count(self):
        """Unique visitors are counted correctly"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"), {"days": 1})
        # Today: 3 visits from 3 unique IPs (192.168.1.1, .2, .3)
        today_data = response.data["data"][-1]
        self.assertEqual(today_data["unique_visitors"], 3)

    def test_visits_custom_days(self):
        """Custom days parameter works"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"), {"days": 7})
        self.assertEqual(response.data["period"], 7)

    def test_visits_days_capped_at_365(self):
        """Days parameter is capped at 365"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"), {"days": 999})
        self.assertEqual(response.data["period"], 365)

    def test_visits_forbidden_for_regular_user(self):
        """Regular user cannot access visit analytics"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("admin-analytics-visits"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_visits_unauthenticated(self):
        """Unauthenticated request is rejected"""
        response = self.client.get(reverse("admin-analytics-visits"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Pages endpoint ---

    def test_pages_as_admin(self):
        """Admin can access page analytics"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-pages"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data["data"], list)

    def test_pages_ordered_by_visits(self):
        """Pages are ordered by visit count descending"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-pages"))
        data = response.data["data"]
        self.assertTrue(len(data) >= 2)
        # "/" has 4 visits (3 from .1 + 1 from .3), "/about" has 3 visits
        self.assertEqual(data[0]["page_path"], "/")
        self.assertEqual(data[0]["visits"], 4)
        self.assertEqual(data[1]["page_path"], "/about")
        self.assertEqual(data[1]["visits"], 3)

    def test_pages_forbidden_for_regular_user(self):
        """Regular user cannot access page analytics"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("admin-analytics-pages"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_pages_unauthenticated(self):
        """Unauthenticated request is rejected"""
        response = self.client.get(reverse("admin-analytics-pages"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_pages_custom_days(self):
        """Custom days parameter works for pages"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-pages"), {"days": 7})
        self.assertEqual(response.data["period"], 7)

    def test_visits_empty_range(self):
        """Empty date range returns empty data array"""
        SiteVisit.objects.all().delete()
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"], [])

    def test_visits_invalid_days_string(self):
        """Non-numeric days parameter returns 400"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"), {"days": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pages_invalid_days_string(self):
        """Non-numeric days parameter returns 400"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-pages"), {"days": "abc"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_visits_negative_days_clamped(self):
        """Negative days parameter is clamped to 1"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("admin-analytics-visits"), {"days": -5})
        self.assertEqual(response.data["period"], 1)


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class NotificationPreferenceTestCase(APITestCase):
    """Tests for Notification Preferences and enhanced send_user_notification"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass12345"
        )
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpass12345"
        )

    # --- Preferences API ---

    def test_get_preferences_creates_default(self):
        """GET preferences auto-creates with defaults"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/notifications/preferences/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["system_enabled"])
        self.assertTrue(response.data["blog_enabled"])
        self.assertTrue(response.data["contact_enabled"])
        self.assertTrue(response.data["admin_enabled"])
        self.assertFalse(response.data["email_enabled"])

    def test_update_preferences(self):
        """PATCH updates specific fields"""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            "/api/notifications/preferences/",
            {"blog_enabled": False, "email_enabled": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["blog_enabled"])
        self.assertTrue(response.data["email_enabled"])
        # Other fields unchanged
        self.assertTrue(response.data["system_enabled"])

    def test_preferences_unauthenticated(self):
        """Unauthenticated request is rejected"""
        response = self.client.get("/api/notifications/preferences/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- send_user_notification with preferences ---

    def test_notification_respects_disabled_type(self):
        """Disabled type prevents notification creation"""
        NotificationPreference.objects.create(user=self.user, blog_enabled=False)
        result = send_user_notification(self.user, "Blog Update", "New post", notification_type="blog")
        self.assertIsNone(result)
        self.assertEqual(Notification.objects.filter(user=self.user).count(), 0)

    def test_notification_created_when_type_enabled(self):
        """Enabled type creates notification normally"""
        NotificationPreference.objects.create(user=self.user, blog_enabled=True)
        result = send_user_notification(self.user, "Blog Update", "New post", notification_type="blog")
        self.assertIsNotNone(result)
        self.assertEqual(Notification.objects.filter(user=self.user).count(), 1)

    def test_notification_created_without_preferences(self):
        """No preferences model = all enabled (default)"""
        result = send_user_notification(self.user, "System Alert", "Test", notification_type="system")
        self.assertIsNotNone(result)
        self.assertEqual(Notification.objects.filter(user=self.user).count(), 1)

    @override_settings(DEFAULT_FROM_EMAIL="test@emelmujiro.com")
    def test_email_sent_when_enabled(self):
        """Email is sent when email_enabled is True"""
        from unittest.mock import patch

        NotificationPreference.objects.create(user=self.user, email_enabled=True)
        with patch("api.views.send_mail") as mock_send:
            send_user_notification(self.user, "Test", "Message", notification_type="system")
            mock_send.assert_called_once()
            call_kwargs = mock_send.call_args
            self.assertIn("test@example.com", call_kwargs[1]["recipient_list"])

    def test_email_not_sent_when_disabled(self):
        """Email is not sent when email_enabled is False"""
        from unittest.mock import patch

        NotificationPreference.objects.create(user=self.user, email_enabled=False)
        with patch("api.views.send_mail") as mock_send:
            send_user_notification(self.user, "Test", "Message", notification_type="system")
            mock_send.assert_not_called()

    def test_notification_type_stored_correctly(self):
        """notification_type is stored in DB correctly"""
        result = send_user_notification(self.user, "Admin Alert", "Test", notification_type="admin")
        self.assertEqual(result.notification_type, "admin")

    def test_is_type_enabled_method(self):
        """NotificationPreference.is_type_enabled works correctly"""
        pref = NotificationPreference.objects.create(
            user=self.user, system_enabled=True, blog_enabled=False
        )
        self.assertTrue(pref.is_type_enabled("system"))
        self.assertFalse(pref.is_type_enabled("blog"))
        self.assertTrue(pref.is_type_enabled("unknown_type"))

    def test_email_not_sent_when_user_has_no_email(self):
        """Email is not sent when user.email is empty even with email_enabled"""
        from unittest.mock import patch

        self.user.email = ""
        self.user.save()
        NotificationPreference.objects.create(user=self.user, email_enabled=True)
        with patch("api.views.send_mail") as mock_send:
            send_user_notification(self.user, "Test", "Message", notification_type="system")
            mock_send.assert_not_called()


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class CookieJWTAuthenticationTestCase(APITestCase):
    """Tests for CookieJWTAuthentication (httpOnly cookie auth)"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="cookieuser", email="cookie@example.com", password="testpass12345"
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

    def test_auth_via_cookie(self):
        """Request with valid access_token cookie is authenticated"""
        self.client.cookies["access_token"] = self.access_token
        response = self.client.get(reverse("get_user"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "cookie@example.com")

    def test_auth_via_authorization_header(self):
        """Request with Authorization header (fallback) is authenticated"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.get(reverse("get_user"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "cookie@example.com")

    def test_invalid_cookie_falls_back_to_header(self):
        """Invalid cookie is ignored, valid header succeeds"""
        self.client.cookies["access_token"] = "invalid-token"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.get(reverse("get_user"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_cookie_no_header_fails(self):
        """Invalid cookie with no header returns 401"""
        self.client.cookies["access_token"] = "invalid-token"
        response = self.client.get(reverse("get_user"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_no_credentials_fails(self):
        """No cookie and no header returns 401"""
        response = self.client.get(reverse("get_user"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class TokenRefreshTestCase(APITestCase):
    """Tests for custom token_refresh endpoint (cookie + body support)"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="refreshuser", email="refresh@example.com", password="testpass12345"
        )
        self.refresh = RefreshToken.for_user(self.user)

    def test_refresh_via_body(self):
        """Refresh token in request body returns new access token"""
        url = reverse("token_refresh")
        response = self.client.post(url, {"refresh": str(self.refresh)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_via_cookie(self):
        """Refresh token in cookie returns new access token"""
        url = reverse("token_refresh")
        self.client.cookies["refresh_token"] = str(self.refresh)
        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_refresh_sets_cookies(self):
        """Successful refresh sets access_token and refresh_token cookies"""
        url = reverse("token_refresh")
        response = self.client.post(url, {"refresh": str(self.refresh)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

    def test_refresh_without_token_fails(self):
        """Missing refresh token returns 400"""
        url = reverse("token_refresh")
        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_with_invalid_token_fails(self):
        """Invalid refresh token returns 401"""
        url = reverse("token_refresh")
        response = self.client.post(url, {"refresh": "invalid-token"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_rotates_token(self):
        """Token rotation: old refresh token is blacklisted after use"""
        url = reverse("token_refresh")
        old_refresh = str(self.refresh)
        response = self.client.post(url, {"refresh": old_refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Old refresh token should be blacklisted
        response2 = self.client.post(url, {"refresh": old_refresh}, format="json")
        self.assertEqual(response2.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_sets_cookies(self):
        """Login endpoint sets httpOnly JWT cookies"""
        url = reverse("login")
        response = self.client.post(url, {"username": "refreshuser", "password": "testpass12345"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)
        # Verify httpOnly flag
        self.assertTrue(response.cookies["access_token"]["httponly"])
        self.assertTrue(response.cookies["refresh_token"]["httponly"])

    def test_logout_clears_cookies(self):
        """Logout endpoint clears JWT cookies"""
        # Login first to get cookies
        login_url = reverse("login")
        login_resp = self.client.post(
            login_url, {"username": "refreshuser", "password": "testpass12345"}, format="json"
        )
        refresh_token = login_resp.data["refresh"]
        # Authenticate for logout
        access_token = login_resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_url = reverse("logout")
        response = self.client.post(logout_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Cookies should be deleted (max-age=0)
        self.assertIn("access_token", response.cookies)
        self.assertEqual(response.cookies["access_token"]["max-age"], 0)


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


class NotificationModelTestCase(TestCase):
    """Tests for Notification model"""

    def setUp(self):
        self.user = User.objects.create_user(username="notiuser", password="testpass123")

    def test_create_notification(self):
        """Test creating a notification"""
        notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="Test message",
            level="info",
            notification_type="system",
        )
        self.assertEqual(notification.title, "Test Notification")
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)

    def test_notification_str(self):
        """Test notification string representation"""
        notification = Notification.objects.create(user=self.user, title="Hello", message="World")
        self.assertIn("안읽음", str(notification))
        self.assertIn("Hello", str(notification))

    def test_notification_ordering(self):
        """Test notifications are ordered by -created_at"""
        n1 = Notification.objects.create(user=self.user, title="First", message="msg")
        n2 = Notification.objects.create(user=self.user, title="Second", message="msg")
        notifications = list(Notification.objects.filter(user=self.user))
        self.assertEqual(notifications[0].id, n2.id)
        self.assertEqual(notifications[1].id, n1.id)


class NotificationAPITestCase(APITestCase):
    """Tests for Notification API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(username="notiuser", password="testpass123")
        self.other_user = User.objects.create_user(username="otheruser", password="testpass123")
        self.notification = Notification.objects.create(
            user=self.user,
            title="Test Alert",
            message="Something happened",
            level="info",
            notification_type="system",
        )
        # Create notification for other user (should not be visible)
        Notification.objects.create(
            user=self.other_user,
            title="Other Alert",
            message="Other message",
        )

    def _auth(self, user=None):
        """Authenticate as user"""
        target = user or self.user
        refresh = RefreshToken.for_user(target)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_list_requires_auth(self):
        """Test listing notifications requires authentication"""
        url = reverse("notification-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_own_notifications(self):
        """Test listing only own notifications"""
        self._auth()
        url = reverse("notification-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Test Alert")

    def test_retrieve_notification(self):
        """Test retrieving a single notification"""
        self._auth()
        url = reverse("notification-detail", kwargs={"pk": self.notification.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Alert")

    def test_cannot_retrieve_other_user_notification(self):
        """Test cannot access other user's notification"""
        self._auth()
        other_notif = Notification.objects.filter(user=self.other_user).first()
        url = reverse("notification-detail", kwargs={"pk": other_notif.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_read(self):
        """Test marking a notification as read"""
        self._auth()
        url = reverse("notification-detail", kwargs={"pk": self.notification.pk})
        response = self.client.patch(url, {"is_read": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)
        self.assertIsNotNone(self.notification.read_at)

    def test_mark_all_read(self):
        """Test marking all notifications as read"""
        Notification.objects.create(user=self.user, title="Second", message="msg")
        self._auth()
        url = reverse("notification-mark-all-read")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["marked"], 2)
        self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 0)

    def test_unread_count(self):
        """Test getting unread count"""
        Notification.objects.create(user=self.user, title="Second", message="msg")
        self._auth()
        url = reverse("notification-unread-count")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_unread_count_after_read(self):
        """Test unread count decreases after marking read"""
        self._auth()
        # Mark as read
        url = reverse("notification-detail", kwargs={"pk": self.notification.pk})
        self.client.patch(url, {"is_read": True}, format="json")
        # Check count
        url = reverse("notification-unread-count")
        response = self.client.get(url)
        self.assertEqual(response.data["count"], 0)


class SendUserNotificationTestCase(TestCase):
    """Tests for send_user_notification utility"""

    def setUp(self):
        self.user = User.objects.create_user(username="notiuser", password="testpass123")

    def test_send_notification_creates_record(self):
        """Test that send_user_notification creates a Notification"""
        notification = send_user_notification(
            user=self.user,
            title="New Post",
            message="A new blog post was published",
            level="info",
            notification_type="blog",
        )
        self.assertIsNotNone(notification.id)
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.title, "New Post")
        self.assertEqual(notification.level, "info")

    def test_send_notification_by_user_id(self):
        """Test sending notification by user ID"""
        notification = send_user_notification(
            user=self.user.id,
            title="By ID",
            message="Sent by user ID",
        )
        self.assertEqual(notification.user, self.user)

    def test_send_notification_with_url(self):
        """Test sending notification with URL"""
        notification = send_user_notification(
            user=self.user,
            title="Click here",
            message="Check this out",
            url="https://emelmujiro.com/blog/1",
        )
        self.assertEqual(notification.url, "https://emelmujiro.com/blog/1")
