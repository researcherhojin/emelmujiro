from django.db import models
from django.utils import timezone
from django.core.validators import URLValidator
from django.contrib.auth.models import User
import uuid


class BlogPost(models.Model):
    CATEGORY_CHOICES = [
        ("ai", "AI"),
        ("ml", "Machine Learning"),
        ("ds", "Data Science"),
        ("nlp", "Natural Language Processing"),
        ("cv", "Computer Vision"),
        ("rl", "Reinforcement Learning"),
        ("education", "교육"),
        ("career", "경력"),
        ("project", "프로젝트"),
        ("other", "기타"),
    ]

    title = models.CharField(max_length=200, verbose_name="제목")
    description = models.TextField(verbose_name="설명")
    content = models.TextField(verbose_name="내용")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, verbose_name="카테고리")
    date = models.DateTimeField(default=timezone.now, verbose_name="작성일")
    image_url = models.URLField(blank=True, null=True, validators=[URLValidator()], verbose_name="이미지 URL")
    link = models.URLField(blank=True, null=True, validators=[URLValidator()], verbose_name="관련 링크")
    is_published = models.BooleanField(default=True, verbose_name="공개 여부")
    is_featured = models.BooleanField(default=False, verbose_name="추천 글")
    view_count = models.PositiveIntegerField(default=0, verbose_name="조회수")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    class Meta:
        ordering = ["-date"]
        verbose_name = "블로그 포스트"
        verbose_name_plural = "블로그 포스트"

    def __str__(self):
        return self.title


class Contact(models.Model):
    INQUIRY_TYPE_CHOICES = [
        ("lecture", "강의 문의"),
        ("consulting", "컨설팅 문의"),
        ("collaboration", "협업 제안"),
        ("media", "미디어/인터뷰 문의"),
        ("general", "일반 문의"),
        ("other", "기타"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="이름")
    email = models.EmailField(verbose_name="이메일")
    company = models.CharField(max_length=100, blank=True, verbose_name="회사명")
    phone = models.CharField(max_length=20, blank=True, verbose_name="연락처")
    inquiry_type = models.CharField(
        max_length=50,
        choices=INQUIRY_TYPE_CHOICES,
        default="general",
        verbose_name="문의 유형",
    )
    subject = models.CharField(max_length=200, verbose_name="제목")
    message = models.TextField(verbose_name="내용")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP 주소")
    user_agent = models.TextField(blank=True, verbose_name="사용자 에이전트")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="문의일")
    is_processed = models.BooleanField(default=False, verbose_name="처리 여부")
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="처리일")
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="처리자")
    notes = models.TextField(blank=True, verbose_name="관리자 메모")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "문의"
        verbose_name_plural = "문의"

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d')}] {self.name} - {self.subject}"


class ContactAttempt(models.Model):
    """문의 시도 로그 - 스팸 방지용"""

    ip_address = models.GenericIPAddressField(verbose_name="IP 주소")
    email = models.EmailField(null=True, blank=True, verbose_name="이메일")
    attempt_count = models.PositiveIntegerField(default=1, verbose_name="시도 횟수")
    last_attempt = models.DateTimeField(auto_now=True, verbose_name="마지막 시도")
    is_blocked = models.BooleanField(default=False, verbose_name="차단 여부")
    block_reason = models.CharField(max_length=200, blank=True, verbose_name="차단 사유")

    class Meta:
        unique_together = ["ip_address", "email"]
        verbose_name = "문의 시도 로그"
        verbose_name_plural = "문의 시도 로그"

    def __str__(self):
        return f"{self.ip_address} - {self.attempt_count}회 시도"


class SiteVisit(models.Model):
    """사이트 방문 로그"""

    ip_address = models.GenericIPAddressField(verbose_name="IP 주소")
    user_agent = models.TextField(verbose_name="사용자 에이전트")
    referer = models.URLField(blank=True, verbose_name="참조 URL")
    page_path = models.CharField(max_length=500, verbose_name="페이지 경로")
    visit_time = models.DateTimeField(auto_now_add=True, verbose_name="방문 시간")
    session_id = models.CharField(max_length=100, blank=True, verbose_name="세션 ID")

    class Meta:
        verbose_name = "사이트 방문"
        verbose_name_plural = "사이트 방문"
        indexes = [
            models.Index(fields=["ip_address", "visit_time"]),
            models.Index(fields=["page_path", "visit_time"]),
        ]

    def __str__(self):
        return f"{self.ip_address} - {self.page_path} ({self.visit_time.strftime('%Y-%m-%d %H:%M')})"


class NewsletterSubscription(models.Model):
    """뉴스레터 구독"""

    email = models.EmailField(unique=True, verbose_name="이메일")
    name = models.CharField(max_length=100, blank=True, verbose_name="이름")
    is_active = models.BooleanField(default=True, verbose_name="구독 활성화")
    subscribed_at = models.DateTimeField(auto_now_add=True, verbose_name="구독일")
    unsubscribed_at = models.DateTimeField(null=True, blank=True, verbose_name="구독 해지일")
    unsubscribe_token = models.UUIDField(default=uuid.uuid4, verbose_name="구독 해지 토큰")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP 주소")

    class Meta:
        verbose_name = "뉴스레터 구독"
        verbose_name_plural = "뉴스레터 구독"

    def __str__(self):
        status = "활성" if self.is_active else "비활성"
        return f"{self.email} ({status})"
