from rest_framework.decorators import api_view, throttle_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from .views import AdminRateThrottle
from .serializers import AdminUserSerializer
from .models import BlogPost, Contact, SiteVisit


def parse_pagination_params(request, default_page_size=20):
    """Parse and validate page/page_size from query params. Returns (page, page_size) or raises ValueError."""
    page = max(1, int(request.query_params.get("page", 1)))
    page_size = min(100, max(1, int(request.query_params.get("page_size", default_page_size))))
    return page, page_size


def paginate_queryset(queryset, page, page_size):
    """Slice queryset and return (items, total, next_page)."""
    total = queryset.count()
    offset = (page - 1) * page_size
    items = queryset[offset : offset + page_size]
    next_page = page + 1 if offset + page_size < total else None
    return items, total, next_page


@api_view(["GET"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_stats(request):
    """Admin dashboard statistics"""
    from django.contrib.auth.models import User

    total_users = User.objects.count()
    total_posts = BlogPost.objects.count()
    total_messages = Contact.objects.count()
    total_views = SiteVisit.objects.count()

    return Response(
        {
            "totalUsers": total_users,
            "totalPosts": total_posts,
            "totalMessages": total_messages,
            "totalViews": total_views,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_content(request):
    """Admin content list (blog posts)"""
    posts = BlogPost.objects.all().order_by("-date")
    items = [
        {
            "id": post.id,
            "title": post.title,
            "type": "blog",
            "status": "published" if post.is_published else "draft",
            "author": post.author,
            "createdAt": post.date.strftime("%Y-%m-%d"),
            "views": post.view_count,
        }
        for post in posts
    ]
    return Response(items)


@api_view(["GET"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_messages(request):
    """Admin contact messages list"""
    try:
        page, page_size = parse_pagination_params(request)
    except (ValueError, TypeError):
        return Response({"error": "Invalid pagination parameters"}, status=400)

    contacts = Contact.objects.all().order_by("-created_at")
    page_items, total, next_page = paginate_queryset(contacts, page, page_size)
    items = [
        {
            "id": str(c.id),
            "name": c.name,
            "email": c.email,
            "subject": c.subject,
            "inquiry_type": c.inquiry_type,
            "is_processed": c.is_processed,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for c in page_items
    ]

    return Response({"count": total, "next": next_page, "results": items})


@api_view(["GET", "PATCH"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_message_detail(request, pk):
    """Admin contact message detail / update"""
    try:
        contact = Contact.objects.get(pk=pk)
    except Contact.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    if request.method == "GET":
        return Response(
            {
                "id": str(contact.id),
                "name": contact.name,
                "email": contact.email,
                "company": contact.company,
                "phone": contact.phone,
                "subject": contact.subject,
                "message": contact.message,
                "inquiry_type": contact.inquiry_type,
                "is_processed": contact.is_processed,
                "processed_at": contact.processed_at.isoformat() if contact.processed_at else None,
                "notes": contact.notes,
                "created_at": contact.created_at.isoformat(),
            }
        )

    # PATCH — mark as processed
    if "is_processed" in request.data:
        contact.is_processed = request.data["is_processed"]
        if contact.is_processed:
            contact.processed_at = timezone.now()
            contact.processed_by = request.user
        else:
            contact.processed_at = None
            contact.processed_by = None
        contact.save(update_fields=["is_processed", "processed_at", "processed_by"])

    if "notes" in request.data:
        contact.notes = request.data["notes"]
        contact.save(update_fields=["notes"])

    return Response({"status": "updated"})


@api_view(["GET"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_users(request):
    """Admin user list with search and filter"""
    from django.contrib.auth.models import User

    try:
        page, page_size = parse_pagination_params(request)
    except (ValueError, TypeError):
        return Response({"error": "Invalid pagination parameters"}, status=400)

    queryset = User.objects.all().order_by("-date_joined")

    # Search by username or email
    search = request.query_params.get("search", "").strip()
    if search:
        search = search[:200]
        queryset = queryset.filter(Q(username__icontains=search) | Q(email__icontains=search))

    # Filter by role
    role = request.query_params.get("role", "").strip()
    if role == "admin":
        queryset = queryset.filter(is_superuser=True)
    elif role == "staff":
        queryset = queryset.filter(is_staff=True, is_superuser=False)
    elif role == "user":
        queryset = queryset.filter(is_staff=False, is_superuser=False)

    # Filter by active status
    is_active = request.query_params.get("is_active", "").strip()
    if is_active == "true":
        queryset = queryset.filter(is_active=True)
    elif is_active == "false":
        queryset = queryset.filter(is_active=False)

    page_items, total, next_page = paginate_queryset(queryset, page, page_size)
    serializer = AdminUserSerializer(page_items, many=True)
    return Response({"count": total, "next": next_page, "results": serializer.data})


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_user_detail(request, pk):
    """Admin user detail / update / delete"""
    from django.contrib.auth.models import User

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if request.method == "GET":
        serializer = AdminUserSerializer(user)
        return Response(serializer.data)

    if request.method == "PATCH":
        # Prevent self-demotion from admin
        if user == request.user and "is_superuser" in request.data and not request.data["is_superuser"]:
            return Response({"error": "Cannot remove your own admin privileges"}, status=400)

        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        if user == request.user:
            return Response({"error": "Cannot delete your own account"}, status=400)
        user.delete()
        return Response(status=204)


@api_view(["GET"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_analytics_visits(request):
    """Daily visit time-series data"""
    try:
        days = min(365, max(1, int(request.query_params.get("days", 30))))
    except (ValueError, TypeError):
        return Response({"error": "Invalid days parameter"}, status=400)

    start_date = timezone.now() - timedelta(days=days)

    daily_data = (
        SiteVisit.objects.filter(visit_time__gte=start_date)
        .annotate(date=TruncDate("visit_time"))
        .values("date")
        .annotate(visits=Count("id"), unique_visitors=Count("ip_address", distinct=True))
        .order_by("date")
    )

    data = [
        {
            "date": entry["date"].isoformat(),
            "visits": entry["visits"],
            "unique_visitors": entry["unique_visitors"],
        }
        for entry in daily_data
    ]

    return Response({"period": days, "data": data})


@api_view(["GET"])
@permission_classes([IsAdminUser])
@throttle_classes([AdminRateThrottle])
def admin_analytics_pages(request):
    """Top visited pages"""
    try:
        days = min(365, max(1, int(request.query_params.get("days", 30))))
    except (ValueError, TypeError):
        return Response({"error": "Invalid days parameter"}, status=400)

    start_date = timezone.now() - timedelta(days=days)

    page_data = (
        SiteVisit.objects.filter(visit_time__gte=start_date)
        .values("page_path")
        .annotate(visits=Count("id"))
        .order_by("-visits")[:10]
    )

    data = [{"page_path": entry["page_path"], "visits": entry["visits"]} for entry in page_data]

    return Response({"period": days, "data": data})
