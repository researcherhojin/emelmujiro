from rest_framework import serializers
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import BlogPost, Contact, ContactAttempt, NewsletterSubscription
import re


class BlogPostSerializer(serializers.ModelSerializer):
    category_display = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    relative_date = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "description",
            "content",
            "category",
            "category_display",
            "date",
            "formatted_date",
            "relative_date",
            "image_url",
            "link",
            "is_featured",
            "view_count",
        ]

    def get_category_display(self, obj):
        return obj.get_category_display()

    def get_formatted_date(self, obj):
        return obj.date.strftime("%Y년 %m월 %d일")

    def get_relative_date(self, obj):
        """상대적 시간 표시"""
        from django.utils import timezone
        from datetime import timedelta

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
        """이름 검증"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("이름은 최소 2자 이상이어야 합니다.")

        # 특수문자 제한
        if not re.match(r"^[a-zA-Z가-힣\s]+$", value.strip()):
            raise serializers.ValidationError(
                "이름에는 한글, 영문, 공백만 사용할 수 있습니다."
            )

        return value.strip()

    def validate_email(self, value):
        """이메일 검증"""
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("올바른 이메일 주소를 입력해주세요.")

        # 도메인 검증
        domain = value.split("@")[1].lower()
        blocked_domains = ["tempmail.org", "10minutemail.com", "guerrillamail.com"]
        if domain in blocked_domains:
            raise serializers.ValidationError("임시 이메일 주소는 사용할 수 없습니다.")

        return value.lower()

    def validate_phone(self, value):
        """전화번호 검증"""
        if not value:
            return value

        # 공백 제거
        clean_phone = re.sub(r"\s+", "", value)

        # 한국 전화번호 패턴 검증
        korean_phone_pattern = (
            r"^(01[016789]|02|0[3-9][0-9]?)[-]?[0-9]{3,4}[-]?[0-9]{4}$"
        )
        if not re.match(korean_phone_pattern, clean_phone):
            raise serializers.ValidationError(
                "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)"
            )

        return clean_phone

    def validate_subject(self, value):
        """제목 검증"""
        if len(value.strip()) < 5:
            raise serializers.ValidationError("제목은 최소 5자 이상이어야 합니다.")

        if len(value) > 200:
            raise serializers.ValidationError("제목은 200자를 초과할 수 없습니다.")

        return value.strip()

    def validate_message(self, value):
        """메시지 검증"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "문의 내용은 최소 10자 이상이어야 합니다."
            )

        if len(value) > 2000:
            raise serializers.ValidationError(
                "문의 내용은 2000자를 초과할 수 없습니다."
            )

        # 스팸 키워드 체크
        spam_keywords = ["대출", "투자", "수익", "홍보", "광고", "마케팅"]
        message_lower = value.lower()

        spam_count = sum(1 for keyword in spam_keywords if keyword in message_lower)
        if spam_count >= 2:
            raise serializers.ValidationError(
                "스팸으로 의심되는 내용이 포함되어 있습니다."
            )

        return value.strip()

    def validate_company(self, value):
        """회사명 검증"""
        if value and len(value.strip()) > 100:
            raise serializers.ValidationError("회사명은 100자를 초과할 수 없습니다.")

        return value.strip() if value else value


class ContactAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactAttempt
        fields = ["ip_address", "email", "attempt_count", "last_attempt", "is_blocked"]
        read_only_fields = ["last_attempt"]


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ["email", "name"]

    def validate_email(self, value):
        """이메일 검증"""
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("올바른 이메일 주소를 입력해주세요.")

        return value.lower()

    def validate_name(self, value):
        """이름 검증 (선택사항)"""
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("이름은 최소 2자 이상이어야 합니다.")

        if value and not re.match(r"^[a-zA-Z가-힣\s]+$", value.strip()):
            raise serializers.ValidationError(
                "이름에는 한글, 영문, 공백만 사용할 수 있습니다."
            )

        return value.strip() if value else value


class BlogPostListSerializer(serializers.ModelSerializer):
    """블로그 목록용 간단한 serializer"""

    category_display = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_display",
            "date",
            "formatted_date",
            "image_url",
            "is_featured",
            "view_count",
        ]

    def get_category_display(self, obj):
        return obj.get_category_display()

    def get_formatted_date(self, obj):
        return obj.date.strftime("%Y.%m.%d")
