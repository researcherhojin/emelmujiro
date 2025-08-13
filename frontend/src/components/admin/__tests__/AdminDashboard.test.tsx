import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders admin dashboard with sidebar', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText('관리자 대시보드')).toBeInTheDocument();
    expect(screen.getByText('개요')).toBeInTheDocument();
    expect(screen.getByText('콘텐츠 관리')).toBeInTheDocument();
    expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
    expect(screen.getByText('분석')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('displays overview section by default', async () => {
    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('대시보드 개요')).toBeInTheDocument();
      expect(screen.getByText('총 사용자')).toBeInTheDocument();
      expect(screen.getByText('총 게시물')).toBeInTheDocument();
      expect(screen.getByText('총 메시지')).toBeInTheDocument();
      expect(screen.getByText('총 조회수')).toBeInTheDocument();
    });
  });

  it('displays stats after loading', async () => {
    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('1,234')).toBeInTheDocument(); // Total users
      expect(screen.getByText('56')).toBeInTheDocument(); // Total posts
      expect(screen.getByText('789')).toBeInTheDocument(); // Total messages
      expect(screen.getByText('45,678')).toBeInTheDocument(); // Total views
    });
  });

  it('shows recent activity in overview', async () => {
    renderWithProviders(<AdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('최근 활동')).toBeInTheDocument();
      expect(screen.getByText('새 사용자 가입')).toBeInTheDocument();
      expect(screen.getByText('블로그 포스트 작성')).toBeInTheDocument();
      expect(screen.getByText('문의 메시지 접수')).toBeInTheDocument();
    });
  });

  it('switches to content management tab', async () => {
    renderWithProviders(<AdminDashboard />);
    
    const contentTab = screen.getByRole('button', { name: /콘텐츠 관리/i });
    fireEvent.click(contentTab);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '콘텐츠 관리' })).toBeInTheDocument();
      expect(screen.getByText('새 콘텐츠')).toBeInTheDocument();
      expect(screen.getByText('AI 교육의 미래')).toBeInTheDocument();
    });
  });

  it('displays content table with correct columns', async () => {
    renderWithProviders(<AdminDashboard />);
    
    const contentTab = screen.getByRole('button', { name: /콘텐츠 관리/i });
    fireEvent.click(contentTab);
    
    await waitFor(() => {
      expect(screen.getByText('제목')).toBeInTheDocument();
      expect(screen.getByText('유형')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('작성자')).toBeInTheDocument();
      expect(screen.getByText('조회수')).toBeInTheDocument();
      expect(screen.getByText('작성일')).toBeInTheDocument();
    });
  });

  it('handles delete content with confirmation', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithProviders(<AdminDashboard />);
    
    const contentTab = screen.getByRole('button', { name: /콘텐츠 관리/i });
    fireEvent.click(contentTab);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('삭제');
      fireEvent.click(deleteButtons[0]);
    });
    
    expect(confirmSpy).toHaveBeenCalledWith('정말 삭제하시겠습니까?');
    
    // Content should be removed after deletion
    await waitFor(() => {
      expect(screen.queryByText('AI 교육의 미래')).not.toBeInTheDocument();
    });
    
    confirmSpy.mockRestore();
  });

  it('cancels delete when user declines confirmation', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderWithProviders(<AdminDashboard />);
    
    const contentTab = screen.getByRole('button', { name: /콘텐츠 관리/i });
    fireEvent.click(contentTab);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('삭제');
      fireEvent.click(deleteButtons[0]);
    });
    
    // Content should still be present
    expect(screen.getByText('AI 교육의 미래')).toBeInTheDocument();
    
    confirmSpy.mockRestore();
  });

  it('switches to users tab', () => {
    renderWithProviders(<AdminDashboard />);
    
    const usersTab = screen.getByRole('button', { name: /사용자 관리/i });
    fireEvent.click(usersTab);
    
    expect(screen.getByText('사용자 관리 페이지')).toBeInTheDocument();
  });

  it('switches to messages tab', () => {
    renderWithProviders(<AdminDashboard />);
    
    const messagesTab = screen.getByRole('button', { name: /메시지/i });
    fireEvent.click(messagesTab);
    
    expect(screen.getByText('메시지 페이지')).toBeInTheDocument();
  });

  it('switches to analytics tab', () => {
    renderWithProviders(<AdminDashboard />);
    
    const analyticsTab = screen.getByRole('button', { name: /분석/i });
    fireEvent.click(analyticsTab);
    
    expect(screen.getByText('분석 페이지')).toBeInTheDocument();
  });

  it('switches to settings tab', () => {
    renderWithProviders(<AdminDashboard />);
    
    const settingsTab = screen.getByRole('button', { name: /설정/i });
    fireEvent.click(settingsTab);
    
    expect(screen.getByText('설정 페이지')).toBeInTheDocument();
  });

  it('displays logout button', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    renderWithProviders(<AdminDashboard />);
    
    const overviewTab = screen.getByRole('button', { name: /개요/i });
    expect(overviewTab).toHaveClass('bg-gray-800');
    
    const contentTab = screen.getByRole('button', { name: /콘텐츠 관리/i });
    fireEvent.click(contentTab);
    
    expect(contentTab).toHaveClass('bg-gray-800');
  });

  it('shows loading spinner initially', () => {
    renderWithProviders(<AdminDashboard />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays content status badges correctly', async () => {
    renderWithProviders(<AdminDashboard />);
    
    const contentTab = screen.getByRole('button', { name: /콘텐츠 관리/i });
    fireEvent.click(contentTab);
    
    await waitFor(() => {
      expect(screen.getByText('published')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });
  });

  it('displays content type badges', async () => {
    renderWithProviders(<AdminDashboard />);
    
    const contentTab = screen.getByRole('button', { name: /콘텐츠 관리/i });
    fireEvent.click(contentTab);
    
    await waitFor(() => {
      expect(screen.getByText('blog')).toBeInTheDocument();
      expect(screen.getByText('page')).toBeInTheDocument();
    });
  });

  it('renders notification bell icon', () => {
    renderWithProviders(<AdminDashboard />);
    
    const bellButton = document.querySelector('[class*="Bell"]');
    expect(bellButton).toBeTruthy();
  });
});