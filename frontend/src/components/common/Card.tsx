import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'p-8',
  ...props
}) => {
  const baseClasses = `
        bg-white 
        border-2 border-gray-200 
        rounded-2xl 
        transition-all 
        duration-300
        ${padding}
    `;

  const hoverClasses = hover
    ? `
        hover:border-gray-300 
        hover:shadow-xl 
        hover:-translate-y-1
        cursor-pointer
    `
    : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
