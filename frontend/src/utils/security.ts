// 보안 관련 유틸리티 함수들

/**
 * XSS 공격 방지를 위한 HTML 이스케이프
 * @param {string} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
export const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * URL 유효성 검사
 * @param {string} url - 검사할 URL
 * @returns {boolean} 유효한 URL인지 여부
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * 이메일 유효성 검사
 * @param {string} email - 검사할 이메일
 * @returns {boolean} 유효한 이메일인지 여부
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 전화번호 형식 검사
 * @param {string} phone - 검사할 전화번호
 * @returns {boolean} 유효한 전화번호인지 여부
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * 입력값 길이 제한 검사
 * @param {string} input - 검사할 입력값
 * @param {number} maxLength - 최대 길이
 * @returns {boolean} 길이 제한 통과 여부
 */
export const isWithinLength = (input: string, maxLength: number): boolean => {
  return input.length <= maxLength;
};

/**
 * 민감한 정보 마스킹
 * @param {string} str - 마스킹할 문자열
 * @param {number} visibleStart - 앞에서 보여줄 문자 수
 * @param {number} visibleEnd - 뒤에서 보여줄 문자 수
 * @returns {string} 마스킹된 문자열
 */
export const maskSensitiveInfo = (
  str: string, 
  visibleStart: number = 3, 
  visibleEnd: number = 4
): string => {
  if (str.length <= visibleStart + visibleEnd) {
    return str;
  }
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = '*'.repeat(str.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
};