export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('ko-KR', options);
};

/**
 * Format a date string as relative time (e.g., "3 minutes ago", "2 days ago").
 * Falls back to absolute date for dates older than 7 days.
 */
export const formatRelativeTime = (
  dateString: string,
  lang: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes === 0 ? t('blog.timeJustNow') : t('blog.timeMinutesAgo', { count: minutes });
    }
    return t('blog.timeHoursAgo', { count: hours });
  } else if (days < 7) {
    return t('blog.timeDaysAgo', { count: days });
  } else {
    return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US');
  }
};
