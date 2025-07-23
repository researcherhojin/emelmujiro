from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count
from .models import BlogPost, Contact, ContactAttempt, SiteVisit, NewsletterSubscription


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "view_count",
        "is_featured",
        "is_published",
        "date",
    )
    list_filter = ("category", "is_published", "is_featured", "date")
    search_fields = ("title", "description", "content")
    list_editable = ("is_featured", "is_published")
    ordering = ("-date",)
    date_hierarchy = "date"

    fieldsets = (
        ("기본 정보", {"fields": ("title", "description", "content", "category")}),
        ("설정", {"fields": ("is_published", "is_featured", "date")}),
        ("미디어", {"fields": ("image_url", "link")}),
        ("통계", {"fields": ("view_count",), "classes": ("collapse",)}),
    )

    readonly_fields = ("view_count", "created_at", "updated_at")

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(view_count_display=Count("id"))


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "inquiry_type",
        "subject",
        "is_processed",
        "created_at",
        "ip_address_short",
    )
    list_filter = ("inquiry_type", "is_processed", "created_at")
    search_fields = ("name", "email", "company", "subject", "message")
    actions = ["mark_as_processed", "mark_as_unprocessed"]
    readonly_fields = ("id", "ip_address", "user_agent", "created_at")

    fieldsets = (
        ("문의자 정보", {"fields": ("name", "email", "company", "phone")}),
        ("문의 내용", {"fields": ("inquiry_type", "subject", "message")}),
        (
            "처리 상태",
            {"fields": ("is_processed", "processed_at", "processed_by", "notes")},
        ),
        (
            "기술 정보",
            {
                "fields": ("id", "ip_address", "user_agent", "created_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def ip_address_short(self, obj):
        if obj.ip_address:
            return (
                obj.ip_address[:15] + "..."
                if len(obj.ip_address) > 15
                else obj.ip_address
            )
        return "-"

    ip_address_short.short_description = "IP 주소"

    def mark_as_processed(self, request, queryset):
        queryset.update(
            is_processed=True, processed_at=timezone.now(), processed_by=request.user
        )
        self.message_user(request, f"{queryset.count()}개의 문의가 처리되었습니다.")

    def mark_as_unprocessed(self, request, queryset):
        queryset.update(is_processed=False, processed_at=None, processed_by=None)
        self.message_user(
            request, f"{queryset.count()}개의 문의가 미처리 상태로 변경되었습니다."
        )

    mark_as_processed.short_description = "선택된 문의를 처리 완료 상태로 변경"
    mark_as_unprocessed.short_description = "선택된 문의를 미처리 상태로 변경"


@admin.register(ContactAttempt)
class ContactAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "ip_address",
        "email",
        "attempt_count",
        "last_attempt",
        "is_blocked",
    )
    list_filter = ("is_blocked", "last_attempt")
    search_fields = ("ip_address", "email")
    actions = ["block_attempts", "unblock_attempts"]
    readonly_fields = ("last_attempt",)

    def block_attempts(self, request, queryset):
        queryset.update(is_blocked=True, block_reason="관리자에 의한 차단")
        self.message_user(
            request, f"{queryset.count()}개의 IP/이메일이 차단되었습니다."
        )

    def unblock_attempts(self, request, queryset):
        queryset.update(is_blocked=False, block_reason="")
        self.message_user(
            request, f"{queryset.count()}개의 IP/이메일 차단이 해제되었습니다."
        )

    block_attempts.short_description = "선택된 항목 차단"
    unblock_attempts.short_description = "선택된 항목 차단 해제"


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ("ip_address", "page_path", "visit_time", "referer_short")
    list_filter = ("visit_time", "page_path")
    search_fields = ("ip_address", "page_path", "referer")
    readonly_fields = (
        "ip_address",
        "user_agent",
        "referer",
        "page_path",
        "visit_time",
        "session_id",
    )
    date_hierarchy = "visit_time"

    def referer_short(self, obj):
        if obj.referer:
            return obj.referer[:50] + "..." if len(obj.referer) > 50 else obj.referer
        return "-"

    referer_short.short_description = "참조 URL"

    def has_add_permission(self, request):
        return False  # 수동 추가 불가

    def has_change_permission(self, request, obj=None):
        return False  # 수정 불가


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "is_active", "subscribed_at", "ip_address_short")
    list_filter = ("is_active", "subscribed_at")
    search_fields = ("email", "name")
    actions = ["activate_subscriptions", "deactivate_subscriptions"]
    readonly_fields = ("subscribed_at", "unsubscribe_token", "ip_address")

    fieldsets = (
        ("구독자 정보", {"fields": ("email", "name")}),
        ("구독 상태", {"fields": ("is_active", "subscribed_at", "unsubscribed_at")}),
        (
            "기술 정보",
            {"fields": ("unsubscribe_token", "ip_address"), "classes": ("collapse",)},
        ),
    )

    def ip_address_short(self, obj):
        if obj.ip_address:
            return (
                obj.ip_address[:15] + "..."
                if len(obj.ip_address) > 15
                else obj.ip_address
            )
        return "-"

    ip_address_short.short_description = "IP 주소"

    def activate_subscriptions(self, request, queryset):
        queryset.update(is_active=True, unsubscribed_at=None)
        self.message_user(request, f"{queryset.count()}개의 구독이 활성화되었습니다.")

    def deactivate_subscriptions(self, request, queryset):
        queryset.update(is_active=False, unsubscribed_at=timezone.now())
        self.message_user(request, f"{queryset.count()}개의 구독이 비활성화되었습니다.")

    activate_subscriptions.short_description = "선택된 구독 활성화"
    deactivate_subscriptions.short_description = "선택된 구독 비활성화"


# Admin 사이트 커스터마이징
admin.site.site_header = "에멜무지로 관리자"
admin.site.site_title = "에멜무지로 Admin"
admin.site.index_title = "에멜무지로 관리 패널"
