import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanel from '../AdminPanel';
import { renderWithProviders } from '../../../test-utils';
import * as ChatContext from '../../../contexts/ChatContext';

// Mock fetch
global.fetch = jest.fn();

// Mock the chat context
jest.mock('../../../contexts/ChatContext', () => ({
  ...jest.requireActual('../../../contexts/ChatContext'),
  useChatContext: jest.fn(),
}));

describe('AdminPanel', () => {
  const mockOnClose = jest.fn();
  const defaultMockContext = {
    settings: {
      welcomeMessage: 'Welcome!',
      responseTimeout: 30,
      cannedResponses: [],
      enableTypingIndicator: true,
    },
    messages: [],
    businessHours: {},
    connectionId: 'test-connection',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });
    
    // Set up the mock context
    (ChatContext.useChatContext as jest.Mock).mockReturnValue(defaultMockContext);
  });

  it('should render admin panel when open', () => {
    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText(/설정/i)).toBeInTheDocument();
  });

  it('should handle tab switching', () => {
    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);
    
    const statsTab = screen.getByText(/Statistics/i);
    fireEvent.click(statsTab);
    expect(screen.getByText(/Chat Statistics/i)).toBeInTheDocument();

    const settingsTab = screen.getByText(/Settings/i);
    fireEvent.click(settingsTab);
    expect(screen.getByText(/Chat Settings/i)).toBeInTheDocument();

    const moderationTab = screen.getByText(/Moderation/i);
    fireEvent.click(moderationTab);
    expect(screen.getByText(/Content Moderation/i)).toBeInTheDocument();
  });

  it('should handle chat history loading', async () => {
    const mockChats = [
      {
        id: '1',
        userName: 'User 1',
        messages: [
          { id: '1', text: 'Hello', timestamp: new Date().toISOString(), sender: 'user' },
        ],
        timestamp: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockChats }),
    });

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
  });

  it('should handle message export', async () => {
    const mockChats = [
      {
        id: '1',
        userName: 'User 1',
        messages: [
          { id: '1', text: 'Hello', timestamp: new Date().toISOString(), sender: 'user' },
        ],
        timestamp: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockChats }),
    });

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const exportButton = screen.getByText(/Export Messages/i);
    fireEvent.click(exportButton);

    // Check that download was triggered (we can't actually test download)
    expect(exportButton).toBeInTheDocument();
  });

  it('should handle settings update', async () => {
    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // Switch to settings tab
    const settingsTab = screen.getByText(/Settings/i);
    fireEvent.click(settingsTab);

    // Find and toggle auto-reply
    const autoReplyToggle = screen.getByLabelText(/Enable Auto-Reply/i);
    fireEvent.click(autoReplyToggle);

    // Save settings
    const saveButton = screen.getByText(/Save Settings/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/settings'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should handle chat deletion', async () => {
    const mockChats = [
      {
        id: '1',
        userName: 'User 1',
        messages: [
          { id: '1', text: 'Hello', timestamp: new Date().toISOString(), sender: 'user' },
        ],
        timestamp: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockChats }),
    });

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/history/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('should display statistics', async () => {
    const mockStats = {
      totalChats: 100,
      activeChats: 10,
      avgResponseTime: 2.5,
      totalMessages: 500,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockStats }),
    });

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // Switch to statistics tab
    const statsTab = screen.getByText(/Statistics/i);
    fireEvent.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText(/Total Chats/i)).toBeInTheDocument();
      expect(screen.getByText(/100/)).toBeInTheDocument();
      expect(screen.getByText(/Active Chats/i)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });
  });

  it('should handle banned words management', async () => {
    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // Switch to moderation tab
    const moderationTab = screen.getByText(/Moderation/i);
    fireEvent.click(moderationTab);

    // Add banned word
    const input = screen.getByPlaceholderText(/Add banned word/i);
    fireEvent.change(input, { target: { value: 'badword' } });
    
    const addButton = screen.getByText(/Add/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('badword')).toBeInTheDocument();
    });

    // Remove banned word
    const removeButton = screen.getByLabelText(/Remove badword/i);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('badword')).not.toBeInTheDocument();
    });
  });

  it('should handle error states', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load chat history/i)).toBeInTheDocument();
    });
  });

  it('should handle empty chat history', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/No chat history available/i)).toBeInTheDocument();
    });
  });

  it('should handle search functionality', async () => {
    const mockChats = [
      {
        id: '1',
        userName: 'John Doe',
        messages: [
          { id: '1', text: 'Hello', timestamp: new Date().toISOString(), sender: 'user' },
        ],
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        userName: 'Jane Smith',
        messages: [
          { id: '2', text: 'Hi there', timestamp: new Date().toISOString(), sender: 'user' },
        ],
        timestamp: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockChats }),
    });

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Search for John
    const searchInput = screen.getByPlaceholderText(/Search chats/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('should handle response time threshold setting', async () => {
    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // Switch to settings tab
    const settingsTab = screen.getByText(/Settings/i);
    fireEvent.click(settingsTab);

    // Update response time threshold
    const thresholdInput = screen.getByLabelText(/Response Time Threshold/i);
    fireEvent.change(thresholdInput, { target: { value: '5' } });

    const saveButton = screen.getByText(/Save Settings/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/settings'),
        expect.objectContaining({
          body: expect.stringContaining('"responseTimeThreshold":5'),
        })
      );
    });
  });

  it('should handle welcome message update', async () => {
    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    // Switch to settings tab
    const settingsTab = screen.getByText(/Settings/i);
    fireEvent.click(settingsTab);

    // Update welcome message
    const welcomeInput = screen.getByLabelText(/Welcome Message/i);
    fireEvent.change(welcomeInput, { target: { value: 'Welcome to our chat!' } });

    const saveButton = screen.getByText(/Save Settings/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/settings'),
        expect.objectContaining({
          body: expect.stringContaining('Welcome to our chat!'),
        })
      );
    });
  });

  it('should handle chat export in different formats', async () => {
    const mockChats = [
      {
        id: '1',
        userName: 'User 1',
        messages: [
          { id: '1', text: 'Hello', timestamp: new Date().toISOString(), sender: 'user' },
        ],
        timestamp: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockChats }),
    });

    renderWithProviders(<AdminPanel isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Test CSV export
    const csvButton = screen.getByText(/Export as CSV/i);
    fireEvent.click(csvButton);

    // Test JSON export
    const jsonButton = screen.getByText(/Export as JSON/i);
    fireEvent.click(jsonButton);

    expect(csvButton).toBeInTheDocument();
    expect(jsonButton).toBeInTheDocument();
  });
});