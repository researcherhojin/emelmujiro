import React, { memo } from 'react';
import { Mail, Phone } from 'lucide-react';

interface ContactIconProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  link?: string;
}

const ContactIcon: React.FC<ContactIconProps> = memo(
  ({ icon, title, value, link }) => (
    <div className="flex items-center space-x-4">
      <div className="text-gray-600 dark:text-gray-400">{icon}</div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        {link ? (
          <a
            href={link}
            className="text-lg font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={`${title}: ${value}`}
          >
            {value}
          </a>
        ) : (
          <div className="text-lg font-medium text-gray-900 dark:text-white">
            {value}
          </div>
        )}
      </div>
    </div>
  )
);

ContactIcon.displayName = 'ContactIcon';

const ContactInfo: React.FC = memo(() => {
  return (
    <div className="space-y-6">
      <ContactIcon
        icon={<Mail className="w-6 h-6" />}
        title="이메일"
        value="researcherhojin@gmail.com"
        link="mailto:researcherhojin@gmail.com"
      />

      <ContactIcon
        icon={<Phone className="w-6 h-6" />}
        title="전화번호"
        value="직접 문의 부탁드립니다"
      />

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          업무 시간
        </h3>
        <div className="space-y-1 text-gray-600 dark:text-gray-400">
          <p>월요일 - 금요일: 09:00 - 18:00</p>
          <p>토요일 - 일요일: 휴무</p>
        </div>
      </div>

      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          빠른 응답 시간
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          보통 24시간 이내에 답변드립니다.
        </p>
      </div>
    </div>
  );
});

ContactInfo.displayName = 'ContactInfo';

export default ContactInfo;
