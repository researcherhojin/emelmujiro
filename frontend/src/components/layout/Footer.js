import React from 'react';
import { Phone, Mail, ArrowUpRight, BookOpen, Code, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const contactInfo = [
        {
            Icon: Phone, // or icon: <Phone className="w-6 h-6" />,
            text: '010-7279-0380',
            href: 'tel:010-7279-0380',
            title: '전화',
        },
        {
            Icon: Mail, // or icon: <Mail className="w-6 h-6" />,
            text: 'researcherhojin@gmail.com',
            href: 'mailto:researcherhojin@gmail.com',
            title: '이메일',
        },
    ];
    const mainLinks = [
        {
            title: '서비스',
            items: [
                { text: '실무 AI 교육', href: '#services', icon: <BookOpen className="w-4 h-4" /> },
                { text: '맞춤형 과정', href: '#education', icon: <Code className="w-4 h-4" /> },
                { text: '기업 교육', href: '#about', icon: <Users className="w-4 h-4" /> },
            ],
        },
        {
            title: '리소스',
            items: [
                { text: 'AI 도입 사례', href: '#about' },
                { text: 'AI 트렌드', href: '/blog' },
                { text: '교육 과정', href: '#education' },
            ],
        },
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-6xl mx-auto px-4">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="block">
                            <h2 className="text-2xl font-bold hover:text-indigo-400 transition-colors">에멜무지로</h2>
                        </Link>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            함께 시작하는 AI 여정
                            <br />
                            실무 중심의 AI 교육으로
                            <br />
                            기업의 디지털 성장을 돕습니다
                        </p>
                    </div>

                    {/* Main Links Sections */}
                    {mainLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-lg font-semibold mb-4 text-gray-100">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.items.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-gray-300 hover:text-white inline-flex items-center 
                                                     group gap-2 hover:translate-x-1 transition-all"
                                        >
                                            {link.icon && <span className="text-indigo-400">{link.icon}</span>}
                                            <span>{link.text}</span>
                                            <ArrowUpRight
                                                className="w-4 h-4 opacity-0 group-hover:opacity-100 
                                                                  transition-all"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-100">Contact</h3>
                        <div className="space-y-4">
                            {contactInfo.map((info, index) => (
                                <div key={index} className="flex items-start space-x-3 group">
                                    <info.Icon
                                        className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-400 
                                                 group-hover:text-indigo-300 transition-colors"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        {info.href ? (
                                            <a
                                                href={info.href}
                                                className="text-gray-300 hover:text-white transition-colors
                                                         inline-block"
                                                aria-label={info.text}
                                            >
                                                {info.text}
                                            </a>
                                        ) : (
                                            <p className="text-gray-300">{info.text}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">© {currentYear} 에멜무지로. All rights reserved.</p>
                        <p className="text-gray-500 text-sm">사업자등록번호: 174-29-01733</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
