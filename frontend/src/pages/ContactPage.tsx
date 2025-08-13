import React, { useState, useCallback, memo } from 'react';

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

const ContactPage: React.FC = memo(() => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    // 실제 전송 로직은 필요시 추가
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 py-24">
      <div className="w-full max-w-md bg-black border border-white/20 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-8 text-white text-center">
          Contact
        </h1>
        {submitted ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-white mb-4">
              문의가 정상적으로 접수되었습니다.
            </p>
            <p className="text-gray-400">빠른 시일 내에 답변드리겠습니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder="example@company.com"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                회사명
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder="회사명을 입력해주세요"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                문의 내용
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                placeholder="문의하실 내용을 자세히 적어주세요"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              문의하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

ContactPage.displayName = 'ContactPage';

export default ContactPage;
