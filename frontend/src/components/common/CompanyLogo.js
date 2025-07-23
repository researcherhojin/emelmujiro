import React from 'react';

const CompanyLogo = ({ name, color, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-20 h-12 text-sm',
        md: 'w-32 h-16 text-base',
        lg: 'w-40 h-20 text-lg'
    };

    const logoStyles = {
        '삼성전자': {
            text: 'SAMSUNG',
            font: 'font-bold tracking-wider',
            bgColor: 'bg-white'
        },
        'SK': {
            text: 'SK',
            font: 'font-black italic',
            bgColor: 'bg-white'
        },
        'LG': {
            text: 'LG',
            font: 'font-bold',
            bgColor: 'bg-white'
        },
        '한국전력공사': {
            text: 'KEPCO',
            font: 'font-semibold',
            bgColor: 'bg-white'
        },
        '국민은행': {
            text: 'KB',
            font: 'font-bold',
            bgColor: 'bg-white'
        },
        'CJ': {
            text: 'CJ',
            font: 'font-black',
            bgColor: 'bg-white'
        },
        '현대자동차': {
            text: 'HYUNDAI',
            font: 'font-bold italic',
            bgColor: 'bg-white'
        },
        '포스코': {
            text: 'POSCO',
            font: 'font-bold',
            bgColor: 'bg-white'
        },
        'KT': {
            text: 'KT',
            font: 'font-black',
            bgColor: 'bg-white'
        },
        '네이버': {
            text: 'NAVER',
            font: 'font-bold',
            bgColor: 'bg-white'
        }
    };

    const logo = logoStyles[name] || { text: name, font: 'font-semibold', bgColor: 'bg-white' };

    return (
        <div className={`${sizeClasses[size]} ${logo.bgColor} rounded-lg flex items-center 
            justify-center px-4 relative overflow-hidden group`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" 
                    style={{
                        backgroundImage: `repeating-linear-gradient(
                            45deg,
                            ${color},
                            ${color} 10px,
                            transparent 10px,
                            transparent 20px
                        )`
                    }}
                />
            </div>
            
            {/* Logo Text */}
            <span 
                className={`${logo.font} relative z-10 transition-transform 
                    group-hover:scale-110`}
                style={{ color }}
            >
                {logo.text}
            </span>
        </div>
    );
};

export default React.memo(CompanyLogo);