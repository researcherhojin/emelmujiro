import { i18n } from 'i18next';

/**
 * Format number according to current locale
 */
export const formatNumber = (number: number, i18n: i18n): string => {
  const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format currency according to current locale
 */
export const formatCurrency = (amount: number, i18n: i18n, currency = 'KRW'): string => {
  const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
  const currencyCode = i18n.language === 'ko' ? 'KRW' : currency === 'KRW' ? 'USD' : currency;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Format date according to current locale
 */
export const formatDate = (
  date: Date | string,
  i18n: i18n,
  options?: Intl.DateTimeFormatOptions
): string => {
  const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string, i18n: i18n): string => {
  const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return i18n.t('time.now', { ns: 'common' });
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return rtf.format(-minutes, 'minute');
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return rtf.format(-hours, 'hour');
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return rtf.format(-days, 'day');
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return rtf.format(-months, 'month');
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return rtf.format(-years, 'year');
  }
};

/**
 * Format file size according to current locale
 */
export const formatFileSize = (bytes: number, i18n: i18n): string => {
  const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
  const sizes =
    i18n.language === 'ko' ? ['바이트', 'KB', 'MB', 'GB', 'TB'] : ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (bytes === 0) return `0 ${sizes[0]}`;

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(size)} ${sizes[i]}`;
};

/**
 * Format percentage according to current locale
 */
export const formatPercentage = (value: number, i18n: i18n): string => {
  const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Format duration (e.g., "2시간 30분" or "2h 30m")
 */
export const formatDuration = (minutes: number, i18n: i18n): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (i18n.language === 'ko') {
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}시간 ${remainingMinutes}분`;
    } else if (hours > 0) {
      return `${hours}시간`;
    } else {
      return `${remainingMinutes}분`;
    }
  } else {
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  }
};

/**
 * Format phone number according to current locale
 */
export const formatPhoneNumber = (phoneNumber: string, i18n: i18n): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (i18n.language === 'ko') {
    // Korean phone number format
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
  } else {
    // US phone number format
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    }
  }

  return phoneNumber; // Return original if no pattern matches
};

/**
 * Format list of items according to current locale
 */
export const formatList = (items: string[], language: string): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];

  if (language === 'ko') {
    // Korean format: "사과, 바나나, 오렌지"
    return items.join(', ');
  } else {
    // English format: "apple, banana, and orange"
    if (items.length === 2) {
      return items.join(' and ');
    }
    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1);
    return `${otherItems.join(', ')}, and ${lastItem}`;
  }
};
