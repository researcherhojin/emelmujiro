from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Standard pagination with max page size protection"""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
