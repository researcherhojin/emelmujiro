from rest_framework import serializers
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import BlogPost, Contact, Notification, NotificationPreference, NewsletterSubscription
import re


class UserSerializer(serializers.ModelSerializer):
    """User serializer for authentication"""

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role"]
        read_only_fields = ["id"]

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.is_staff:
            return "staff"
        return "user"


class AdminUserSerializer(serializers.ModelSerializer):
    """User serializer for admin user management"""

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "username", "email", "date_joined", "last_login"]

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.is_staff:
            return "staff"
        return "user"


class BlogPostSerializer(serializers.ModelSerializer):
    """Serializer aligned with frontend BlogPost type.

    camelCase aliases (publishedAt, imageUrl, views, published, excerpt) match
    the frontend TypeScript BlogPost type. Snake_case originals (date, image_url,
    view_count, is_published, description) are kept for admin/internal use.
    """

    excerpt = serializers.CharField(source="description", read_only=True)
    publishedAt = serializers.DateTimeField(source="date", format="%Y-%m-%d", read_only=True)
    imageUrl = serializers.URLField(source="image_url", read_only=True)
    views = serializers.IntegerField(source="view_count", read_only=True)
    published = serializers.BooleanField(source="is_published", read_only=True)
    category_display = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    relative_date = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "excerpt",
            "author",
            "publishedAt",
            "category",
            "category_display",
            "tags",
            "imageUrl",
            "image_url",
            "date",
            "formatted_date",
            "relative_date",
            "created_at",
            "updated_at",
            "published",
            "views",
            "view_count",
            "likes",
            "is_featured",
            "content_html",
        ]

    def get_category_display(self, obj):
        return obj.get_category_display()

    def get_formatted_date(self, obj):
        return obj.date.strftime("%Y년 %m월 %d일")

    def get_relative_date(self, obj):
        """Relative time display"""
        from django.utils import timezone

        now = timezone.now()
        diff = now - obj.date

        if diff.days > 365:
            years = diff.days // 365
            return f"{years}년 전"
        elif diff.days > 30:
            months = diff.days // 30
            return f"{months}개월 전"
        elif diff.days > 0:
            return f"{diff.days}일 전"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}시간 전"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}분 전"
        else:
            return "방금 전"


class BlogPostWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating blog posts (admin only)."""

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "description",
            "content",
            "content_html",
            "category",
            "tags",
            "image_url",
            "is_published",
            "is_featured",
            "date",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "date": {"required": False},
            "description": {"required": True},
            "content": {"required": False, "default": ""},
            "content_html": {"required": False, "default": ""},
            "is_published": {"required": False, "default": True},
            "is_featured": {"required": False, "default": False},
        }

    def validate_category(self, value):
        valid_categories = [c[0] for c in BlogPost.CATEGORY_CHOICES]
        if value and value not in valid_categories:
            raise serializers.ValidationError(
                f"유효하지 않은 카테고리입니다. 허용: {', '.join(valid_categories)}"
            )
        return value


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Notification preference serializer"""

    class Meta:
        model = NotificationPreference
        fields = [
            "system_enabled",
            "blog_enabled",
            "contact_enabled",
            "admin_enabled",
            "email_enabled",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "level",
            "notification_type",
            "url",
            "is_read",
            "read_at",
            "created_at",
        ]
        read_only_fields = ["id", "title", "message", "level", "notification_type", "url", "created_at"]


class ContactSerializer(serializers.ModelSerializer):
    recaptcha_token = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Contact
        fields = [
            "name",
            "email",
            "company",
            "phone",
            "inquiry_type",
            "subject",
            "message",
            "recaptcha_token",
        ]
        extra_kwargs = {
            "ip_address": {"read_only": True},
            "user_agent": {"read_only": True},
        }

    def validate_name(self, value):
        """Validate name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("이름은 최소 2자 이상이어야 합니다.")

        # Restrict special characters
        if not re.match(r"^[a-zA-Z가-힣\s]+$", value.strip()):
            raise serializers.ValidationError("이름에는 한글, 영문, 공백만 사용할 수 있습니다.")

        return value.strip()

    def validate_email(self, value):
        """Validate email address"""
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("올바른 이메일 주소를 입력해주세요.")

        # Domain validation
        domain = value.split("@")[1].lower()
        blocked_domains = ["tempmail.org", "10minutemail.com", "guerrillamail.com"]
        if domain in blocked_domains:
            raise serializers.ValidationError("임시 이메일 주소는 사용할 수 없습니다.")

        return value.lower()

    def validate_phone(self, value):
        """Validate phone number"""
        if not value:
            return value

        # Remove whitespace
        clean_phone = re.sub(r"\s+", "", value)

        # Korean phone number pattern validation
        korean_phone_pattern = r"^(01[016789]|02|0[3-9][0-9]?)[-]?[0-9]{3,4}[-]?[0-9]{4}$"
        if not re.match(korean_phone_pattern, clean_phone):
            raise serializers.ValidationError("올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)")

        return clean_phone

    def validate_subject(self, value):
        """Validate subject"""
        if len(value.strip()) < 5:
            raise serializers.ValidationError("제목은 최소 5자 이상이어야 합니다.")

        if len(value) > 200:
            raise serializers.ValidationError("제목은 200자를 초과할 수 없습니다.")

        return value.strip()

    def validate_message(self, value):
        """Validate message content"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("문의 내용은 최소 10자 이상이어야 합니다.")

        if len(value) > 2000:
            raise serializers.ValidationError("문의 내용은 2000자를 초과할 수 없습니다.")

        # Spam keyword check
        spam_keywords = ["대출", "투자", "수익", "홍보", "광고", "마케팅"]
        message_lower = value.lower()

        spam_count = sum(1 for keyword in spam_keywords if keyword in message_lower)
        if spam_count >= 2:
            raise serializers.ValidationError("스팸으로 의심되는 내용이 포함되어 있습니다.")

        return value.strip()

    def validate_company(self, value):
        """Validate company name"""
        if value and len(value.strip()) > 100:
            raise serializers.ValidationError("회사명은 100자를 초과할 수 없습니다.")

        return value.strip() if value else value


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    # Override email to remove auto-generated UniqueValidator.
    # The view handles duplicate/resubscription logic itself.
    email = serializers.EmailField()

    class Meta:
        model = NewsletterSubscription
        fields = ["email", "name"]

    def validate_email(self, value):
        """Validate email address"""
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("올바른 이메일 주소를 입력해주세요.")

        return value.lower()

    def validate_name(self, value):
        """Validate name (optional field)"""
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("이름은 최소 2자 이상이어야 합니다.")

        if value and not re.match(r"^[a-zA-Z가-힣\s]+$", value.strip()):
            raise serializers.ValidationError("이름에는 한글, 영문, 공백만 사용할 수 있습니다.")

        return value.strip() if value else value
