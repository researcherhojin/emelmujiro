from django.db import models, IntegrityError
from django.utils import timezone
from django.utils.text import slugify
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
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name="슬러그")
    description = models.TextField(verbose_name="설명")
    content = models.TextField(verbose_name="내용")
    content_html = models.TextField(blank=True, default="", verbose_name="HTML 내용")
    author = models.CharField(max_length=100, default="이호진", verbose_name="작성자")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, verbose_name="카테고리")
    tags = models.JSONField(default=list, blank=True, verbose_name="태그")
    # date: author-chosen publish date (shown to readers, used for ordering)
    # created_at: auto-set row insertion time (internal audit)
    # updated_at: auto-set last modification time (internal audit)
    date = models.DateTimeField(default=timezone.now, verbose_name="작성일")
    image_url = models.URLField(blank=True, null=True, validators=[URLValidator()], verbose_name="이미지 URL")
    is_published = models.BooleanField(default=True, verbose_name="공개 여부")
    is_featured = models.BooleanField(default=False, verbose_name="추천 글")
    view_count = models.PositiveIntegerField(default=0, verbose_name="조회수")
    likes = models.PositiveIntegerField(default=0, verbose_name="좋아요")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    class Meta:
        ordering = ["-date"]
        verbose_name = "블로그 포스트"
        verbose_name_plural = "블로그 포스트"
        indexes = [
            models.Index(fields=["is_published", "-date"]),
            models.Index(fields=["category"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title, allow_unicode=True)
            if not base_slug:
                base_slug = f"post-{self.pk or 'new'}"
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        # Retry on IntegrityError from concurrent slug creation
        max_retries = 3
        for attempt in range(max_retries):
            try:
                super().save(*args, **kwargs)
                return
            except IntegrityError:
                if attempt == max_retries - 1:
                    raise
                # Regenerate slug with a higher counter
                base_slug = slugify(self.title, allow_unicode=True) or f"post-{self.pk or 'new'}"
                counter = 1
                while BlogPost.objects.filter(slug=f"{base_slug}-{counter}").exists():
                    counter += 1
                self.slug = f"{base_slug}-{counter}"

    def __str__(self):
        return self.title


class BlogLike(models.Model):
    """Tracks individual likes on blog posts (one per IP per post)."""

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name="blog_likes", verbose_name="게시글")
    ip_address = models.GenericIPAddressField(verbose_name="IP 주소")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    class Meta:
        unique_together = ["post", "ip_address"]
        verbose_name = "블로그 좋아요"
        verbose_name_plural = "블로그 좋아요"

    def __str__(self):
        return f"Like on {self.post.title} from {self.ip_address}"


class BlogComment(models.Model):
    """Blog post comments with optional nested replies."""

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name="blog_comments", verbose_name="게시글")
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies", verbose_name="상위 댓글"
    )
    author_name = models.CharField(max_length=100, verbose_name="작성자")
    content = models.TextField(verbose_name="내용")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP 주소")
    likes = models.PositiveIntegerField(default=0, verbose_name="좋아요")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "블로그 댓글"
        verbose_name_plural = "블로그 댓글"
        indexes = [
            models.Index(fields=["post", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.author_name}: {self.content[:50]}"


class CommentLike(models.Model):
    """Tracks individual likes on comments (one per IP per comment)."""

    comment = models.ForeignKey(
        BlogComment, on_delete=models.CASCADE, related_name="comment_likes", verbose_name="댓글"
    )
    ip_address = models.GenericIPAddressField(verbose_name="IP 주소")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    class Meta:
        unique_together = ["comment", "ip_address"]
        verbose_name = "댓글 좋아요"
        verbose_name_plural = "댓글 좋아요"

    def __str__(self):
        return f"Like on comment {self.comment_id} from {self.ip_address}"


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
    user_agent = models.CharField(max_length=500, blank=True, verbose_name="사용자 에이전트")
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
    """Contact attempt log — for spam prevention"""

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
    """Site visit log"""

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


class Notification(models.Model):
    """User notification"""

    LEVEL_CHOICES = [
        ("info", "Info"),
        ("success", "Success"),
        ("warning", "Warning"),
        ("error", "Error"),
    ]

    TYPE_CHOICES = [
        ("system", "시스템"),
        ("blog", "블로그"),
        ("contact", "문의"),
        ("admin", "관리자"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications", verbose_name="사용자")
    title = models.CharField(max_length=200, verbose_name="제목")
    message = models.TextField(verbose_name="내용")
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="info", verbose_name="레벨")
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="system", verbose_name="유형")
    url = models.URLField(blank=True, verbose_name="링크")
    is_read = models.BooleanField(default=False, verbose_name="읽음 여부")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="읽은 시간")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "알림"
        verbose_name_plural = "알림"
        indexes = [
            models.Index(fields=["user", "is_read", "-created_at"]),
        ]

    def __str__(self):
        status = "읽음" if self.is_read else "안읽음"
        return f"[{status}] {self.title} → {self.user.username}"


class NotificationPreference(models.Model):
    """Per-user notification preferences"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="notification_preference")
    system_enabled = models.BooleanField(default=True, verbose_name="시스템 알림")
    blog_enabled = models.BooleanField(default=True, verbose_name="블로그 알림")
    contact_enabled = models.BooleanField(default=True, verbose_name="문의 알림")
    admin_enabled = models.BooleanField(default=True, verbose_name="관리자 알림")
    email_enabled = models.BooleanField(default=False, verbose_name="이메일 알림")

    class Meta:
        verbose_name = "알림 설정"
        verbose_name_plural = "알림 설정"

    def __str__(self):
        return f"{self.user.username} notification preferences"

    def is_type_enabled(self, notification_type: str) -> bool:
        """Check if a notification type is enabled"""
        type_map = {
            "system": self.system_enabled,
            "blog": self.blog_enabled,
            "contact": self.contact_enabled,
            "admin": self.admin_enabled,
        }
        return type_map.get(notification_type, True)


class NewsletterSubscription(models.Model):
    """Newsletter subscription"""

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
