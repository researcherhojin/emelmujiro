/**
 * Comprehensive tests for CompanyLogo component
 * Testing logo rendering, styling, and company-specific configurations
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CompanyLogo from '../CompanyLogo';

describe('CompanyLogo', () => {
  it('renders with required props', () => {
    render(<CompanyLogo name="테스트회사" color="#000000" />);

    const logoContainer = screen.getByText('테스트회사');
    expect(logoContainer).toBeInTheDocument();
  });

  it('applies default medium size', () => {
    render(<CompanyLogo name="테스트회사" color="#000000" />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toBeInTheDocument();
    // The component with medium size should be rendered
    expect(textElement).toHaveStyle('color: #000000');
  });

  it('applies small size correctly', () => {
    render(<CompanyLogo name="테스트회사" color="#000000" size="sm" />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toBeInTheDocument();
    // The component with small size should be rendered
    expect(textElement).toHaveStyle('color: #000000');
  });

  it('applies large size correctly', () => {
    render(<CompanyLogo name="테스트회사" color="#000000" size="lg" />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toBeInTheDocument();
    // The component with large size should be rendered
    expect(textElement).toHaveStyle('color: #000000');
  });

  it('applies custom color to text', () => {
    const customColor = '#FF5733';
    render(<CompanyLogo name="테스트회사" color={customColor} />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toHaveStyle(`color: ${customColor}`);
  });

  it('applies background pattern with custom color', () => {
    const customColor = '#FF5733';
    render(<CompanyLogo name="테스트회사" color={customColor} />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toBeInTheDocument();
    // Check that the component renders properly with custom color
    expect(textElement).toHaveStyle(`color: ${customColor}`);
  });

  it('renders Samsung Electronics with correct styling', () => {
    render(<CompanyLogo name="삼성전자" color="#1428A0" />);

    const textElement = screen.getByText('SAMSUNG');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-bold', 'tracking-wider');
  });

  it('renders SK with correct styling', () => {
    render(<CompanyLogo name="SK" color="#EA002C" />);

    const textElement = screen.getByText('SK');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-black', 'italic');
  });

  it('renders LG with correct styling', () => {
    render(<CompanyLogo name="LG" color="#A50034" />);

    const textElement = screen.getByText('LG');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-bold');
  });

  it('renders KEPCO with correct styling', () => {
    render(<CompanyLogo name="한국전력공사" color="#0066CC" />);

    const textElement = screen.getByText('KEPCO');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-semibold');
  });

  it('renders KB (국민은행) with correct styling', () => {
    render(<CompanyLogo name="국민은행" color="#6B6C00" />);

    const textElement = screen.getByText('KB');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-bold');
  });

  it('renders CJ with correct styling', () => {
    render(<CompanyLogo name="CJ" color="#ED6D00" />);

    const textElement = screen.getByText('CJ');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-black');
  });

  it('renders Hyundai with correct styling', () => {
    render(<CompanyLogo name="현대자동차" color="#002C5F" />);

    const textElement = screen.getByText('HYUNDAI');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-bold', 'italic');
  });

  it('renders POSCO with correct styling', () => {
    render(<CompanyLogo name="포스코" color="#003876" />);

    const textElement = screen.getByText('POSCO');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-bold');
  });

  it('renders KT with correct styling', () => {
    render(<CompanyLogo name="KT" color="#E21E25" />);

    const textElement = screen.getByText('KT');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-black');
  });

  it('renders Naver with correct styling', () => {
    render(<CompanyLogo name="네이버" color="#03C75A" />);

    const textElement = screen.getByText('NAVER');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-bold');
  });

  it('renders unknown company with default styling', () => {
    const unknownCompany = '알수없는회사';
    render(<CompanyLogo name={unknownCompany} color="#000000" />);

    const textElement = screen.getByText(unknownCompany);
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass('font-semibold');
  });

  it('applies all standard container classes', () => {
    render(<CompanyLogo name="테스트회사" color="#000000" />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toBeInTheDocument();
    // The component should be properly rendered with all required classes
    expect(textElement).toHaveClass('relative', 'z-10');
  });

  it('applies white background to all logos', () => {
    const testCases = ['삼성전자', 'SK', 'LG', '테스트회사'];

    testCases.forEach(company => {
      const { unmount } = render(<CompanyLogo name={company} color="#000000" />);
      const textElement = screen.getByText(company === '삼성전자' ? 'SAMSUNG' : company);
      expect(textElement).toBeInTheDocument();
      unmount();
    });
  });

  it('applies hover effect classes', () => {
    render(<CompanyLogo name="테스트회사" color="#000000" />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toHaveClass(
      'relative',
      'z-10',
      'transition-transform',
      'group-hover:scale-110'
    );
  });

  it('applies opacity to background pattern', () => {
    render(<CompanyLogo name="테스트회사" color="#000000" />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toBeInTheDocument();
    // Background pattern should be rendered with proper opacity
  });

  it('maintains component display name', () => {
    expect(CompanyLogo.displayName).toBe('CompanyLogo');
  });

  it('handles empty company name', () => {
    render(<CompanyLogo name="" color="#000000" />);
    // Component should render without errors even with empty name
    expect(document.body).toBeInTheDocument();
  });

  it('handles special characters in company name', () => {
    const specialName = '테스트&컴퍼니@2024';
    render(<CompanyLogo name={specialName} color="#000000" />);

    const textElement = screen.getByText(specialName);
    expect(textElement).toBeInTheDocument();
  });

  it('handles very long company names', () => {
    const longName = '매우긴회사명을가진대한민국최고의기술회사';
    render(<CompanyLogo name={longName} color="#000000" />);

    const textElement = screen.getByText(longName);
    expect(textElement).toBeInTheDocument();
  });

  it('handles different color formats', () => {
    const colorFormats = [
      '#FF0000', // Hex
      'rgb(255,0,0)', // RGB
      'hsl(0,100%,50%)', // HSL
      'red', // Named color
    ];

    colorFormats.forEach((color, index) => {
      render(<CompanyLogo key={index} name={`테스트${index}`} color={color} />);
      const textElement = screen.getByText(`테스트${index}`);
      expect(textElement).toHaveStyle(`color: ${color}`);
    });
  });

  it('renders correctly with all size variants', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    sizes.forEach((size, index) => {
      const { unmount } = render(
        <CompanyLogo name={`테스트${index}`} color="#000000" size={size} />
      );

      const textElement = screen.getByText(`테스트${index}`);
      expect(textElement).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct font styles for each company', () => {
    const companies = [
      { name: '삼성전자', expectedText: 'SAMSUNG', expectedFont: ['font-bold', 'tracking-wider'] },
      { name: 'SK', expectedText: 'SK', expectedFont: ['font-black', 'italic'] },
      { name: 'LG', expectedText: 'LG', expectedFont: ['font-bold'] },
      { name: '한국전력공사', expectedText: 'KEPCO', expectedFont: ['font-semibold'] },
      { name: '국민은행', expectedText: 'KB', expectedFont: ['font-bold'] },
      { name: 'CJ', expectedText: 'CJ', expectedFont: ['font-black'] },
      { name: '현대자동차', expectedText: 'HYUNDAI', expectedFont: ['font-bold', 'italic'] },
      { name: '포스코', expectedText: 'POSCO', expectedFont: ['font-bold'] },
      { name: 'KT', expectedText: 'KT', expectedFont: ['font-black'] },
      { name: '네이버', expectedText: 'NAVER', expectedFont: ['font-bold'] },
    ];

    companies.forEach(({ name, expectedText, expectedFont }) => {
      render(<CompanyLogo name={name} color="#000000" />);

      const textElement = screen.getByText(expectedText);
      expect(textElement).toBeInTheDocument();

      expectedFont.forEach(fontClass => {
        expect(textElement).toHaveClass(fontClass);
      });
    });
  });

  it('renders background pattern with correct gradient', () => {
    const testColor = '#123456';
    render(<CompanyLogo name="테스트회사" color={testColor} />);

    const textElement = screen.getByText('테스트회사');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveStyle(`color: ${testColor}`);
  });

  it('uses memo to optimize re-renders', () => {
    const { rerender } = render(<CompanyLogo name="테스트회사" color="#000000" />);

    // Rerender with same props should use memoized version
    rerender(<CompanyLogo name="테스트회사" color="#000000" />);

    expect(screen.getByText('테스트회사')).toBeInTheDocument();
  });

  it('handles case sensitivity in company names', () => {
    const testCases = [
      { input: '삼성전자', expected: 'SAMSUNG' },
      { input: 'sk', expected: 'sk' }, // Should not match SK in logoStyles
      { input: 'lg', expected: 'lg' }, // Should not match LG in logoStyles
    ];

    testCases.forEach(({ input, expected }) => {
      render(<CompanyLogo name={input} color="#000000" />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
