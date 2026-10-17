/**
 * Format a date string as a long calendar date in the route language:
 * `en-US` ("October 18, 2026") when `lang` starts with `en`, otherwise
 * `ko-KR` ("2026년 10월 18일"). Callers that pass no language get Korean.
 */
export const formatDate = (dateString: string, lang?: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const locale = lang?.startsWith('en') ? 'en-US' : 'ko-KR';
  return new Date(dateString).toLocaleDateString(locale, options);
};

/**
 * Format a date string as relative time (e.g., "3 minutes ago", "2 days ago").
 * Falls back to absolute date for dates older than 7 days.
 *
 * @param keyPrefix - i18n key namespace (e.g., "blog" uses blog.timeJustNow, "notifications" uses notifications.justNow)
 */
export const formatRelativeTime = (
  dateString: string,
  lang: string,
  t: (key: string, options?: Record<string, unknown>) => string,
  keyPrefix: 'blog' | 'notifications' = 'blog'
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const keys =
    keyPrefix === 'notifications'
      ? {
          justNow: 'notifications.justNow',
          minutes: 'notifications.minutesAgo',
          hours: 'notifications.hoursAgo',
          days: 'notifications.daysAgo',
        }
      : {
          justNow: 'blog.timeJustNow',
          minutes: 'blog.timeMinutesAgo',
          hours: 'blog.timeHoursAgo',
          days: 'blog.timeDaysAgo',
        };

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes === 0 ? t(keys.justNow) : t(keys.minutes, { count: minutes });
    }
    return t(keys.hours, { count: hours });
  } else if (days < 7) {
    return t(keys.days, { count: days });
  } else {
    return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US');
  }
};
