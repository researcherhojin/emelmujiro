# Time constants (seconds)
ONE_HOUR = 3600
ONE_DAY = 86400

# Cache keys
CACHE_BLOG_CATEGORIES = "blog_categories"
CACHE_BLOG_POST_LIST = "blog_post_list"
CACHE_ADMIN_STATS = "admin_stats"

SPAM_THRESHOLD = 2

SPAM_KEYWORDS = [
    # English spam terms
    "betting",
    "bitcoin",
    "casino",
    "click here",
    "crypto",
    "earn money",
    "forex",
    "free money",
    "gambling",
    "lottery",
    "make money online",
    "payday loan",
    "viagra",
    "work from home",
    # Korean spam terms
    "광고",
    "대출",
    "도박",
    "마케팅",
    "불법",
    "성인",
    "수익",
    "카지노",
    "투자",
    "홍보",
]


def is_spam(text: str) -> bool:
    """Check if text contains too many spam keywords."""
    text_lower = text.lower()
    return sum(1 for kw in SPAM_KEYWORDS if kw in text_lower) >= SPAM_THRESHOLD
