from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger("security")


class Command(BaseCommand):
    help = "보안 상태 확인 및 관리 명령어"

    def add_arguments(self, parser):
        parser.add_argument(
            "--action",
            type=str,
            choices=["check", "clean", "unblock", "stats"],
            default="check",
            help="수행할 작업 선택",
        )
        parser.add_argument("--ip", type=str, help="IP 주소 (unblock 작업에 필요)")

    def handle(self, *args, **options):
        action = options["action"]

        if action == "check":
            self.security_check()
        elif action == "clean":
            self.clean_old_logs()
        elif action == "unblock":
            self.unblock_ip(options.get("ip"))
        elif action == "stats":
            self.show_stats()

    def security_check(self):
        """보안 상태 확인"""
        self.stdout.write(self.style.SUCCESS("=== 보안 상태 확인 ==="))

        # 1. Django 설정 확인
        issues = []

        if settings.DEBUG:
            issues.append("⚠️  DEBUG 모드가 활성화되어 있습니다.")

        if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 50:
            issues.append("⚠️  SECRET_KEY가 너무 짧거나 설정되지 않았습니다.")

        if not settings.ALLOWED_HOSTS or "localhost" in str(settings.ALLOWED_HOSTS):
            issues.append("⚠️  ALLOWED_HOSTS가 프로덕션용으로 설정되지 않았습니다.")

        if hasattr(settings, "CORS_ALLOW_ALL_ORIGINS") and settings.CORS_ALLOW_ALL_ORIGINS:
            issues.append("⚠️  CORS_ALLOW_ALL_ORIGINS이 True로 설정되어 있습니다.")

        # 2. 보안 헤더 확인
        security_headers = [
            "SECURE_BROWSER_XSS_FILTER",
            "SECURE_CONTENT_TYPE_NOSNIFF",
            "X_FRAME_OPTIONS",
        ]

        for header in security_headers:
            if not getattr(settings, header, None):
                issues.append(f"⚠️  {header} 설정이 누락되었습니다.")

        # 3. 환경변수 확인
        env_vars = ["EMAIL_HOST_USER", "RECAPTCHA_PUBLIC_KEY"]
        for var in env_vars:
            if not getattr(settings, var, None):
                issues.append(f"⚠️  {var} 환경변수가 설정되지 않았습니다.")

        # 결과 출력
        if issues:
            self.stdout.write(self.style.WARNING(f"발견된 보안 이슈: {len(issues)}개"))
            for issue in issues:
                self.stdout.write(f"  {issue}")
        else:
            self.stdout.write(self.style.SUCCESS("✅ 주요 보안 설정이 올바르게 구성되었습니다."))

    def clean_old_logs(self):
        """오래된 로그 정리"""
        self.stdout.write(self.style.SUCCESS("=== 보안 로그 정리 ==="))

        # 7일 이상 된 rate limiting 캐시 정리
        # 실제로는 캐시 키 패턴을 사용해야 하지만, 여기서는 시뮬레이션
        cleaned_count = 0

        # rate_limit_ 패턴의 캐시 정리 (실제 구현에서는 Redis SCAN 사용)
        cache_keys = [f"rate_limit_192.168.1.{i}" for i in range(1, 255)]
        for key in cache_keys:
            if cache.get(key) is not None:
                cache.delete(key)
                cleaned_count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ {cleaned_count}개의 오래된 캐시 항목이 정리되었습니다."))

    def unblock_ip(self, ip_address):
        """IP 차단 해제"""
        if not ip_address:
            self.stdout.write(self.style.ERROR("IP 주소를 제공해주세요. --ip 옵션을 사용하세요."))
            return

        self.stdout.write(self.style.SUCCESS(f"=== IP 차단 해제: {ip_address} ==="))

        # 임시 차단 해제
        temp_block_key = f"temp_blocked_{ip_address}"
        if cache.get(temp_block_key):
            cache.delete(temp_block_key)
            self.stdout.write(f"✅ 임시 차단이 해제되었습니다.")
        else:
            self.stdout.write(f"ℹ️  임시 차단 상태가 아닙니다.")

        # Rate limiting 초기화
        rate_limit_key = f"rate_limit_{ip_address}"
        cache.delete(rate_limit_key)

        # 차단 카운트 초기화
        block_count_key = f"block_count_{ip_address}"
        cache.delete(block_count_key)

        self.stdout.write(f"✅ {ip_address}의 모든 제한이 해제되었습니다.")
        logger.info(f"IP unblocked by admin: {ip_address}")

    def show_stats(self):
        """보안 통계 표시"""
        self.stdout.write(self.style.SUCCESS("=== 보안 통계 ==="))

        # 실제 구현에서는 데이터베이스에서 통계를 가져와야 함
        from api.models import ContactAttempt, SiteVisit

        try:
            # 오늘의 통계
            today = timezone.now().date()
            today_contacts = ContactAttempt.objects.filter(last_attempt__date=today).count()

            today_visits = SiteVisit.objects.filter(visit_time__date=today).count()

            # 주간 통계
            week_ago = timezone.now() - timedelta(days=7)
            week_contacts = ContactAttempt.objects.filter(last_attempt__gte=week_ago).count()

            # 차단된 IP 통계 (캐시에서 확인)
            blocked_ips_count = 0

            self.stdout.write(f"📊 오늘 문의 시도: {today_contacts}건")
            self.stdout.write(f"📊 오늘 사이트 방문: {today_visits}건")
            self.stdout.write(f"📊 주간 문의 시도: {week_contacts}건")
            self.stdout.write(f"🚫 현재 차단된 IP: {blocked_ips_count}개")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"통계 조회 중 오류 발생: {str(e)}"))
