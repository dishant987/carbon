import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Chat } from '../pages/Chat';
import { useChatStore } from '../hooks/useChatStore';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  fetchChatHistory: vi.fn(),
  clearChatHistory: vi.fn(),
  getAccessToken: vi.fn().mockReturnValue('mock-token'),
  BASE_URL: 'http://localhost:5000/api',
}));

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store state before each test
    useChatStore.setState({
      isOpen: false,
      messages: [],
      isStreaming: false,
    });
  });

  it('renders typing area and suggestion cards when messages list is empty', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([]);
    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Ask anything...')).toBeInTheDocument();
    expect(screen.getByText('Log Transit Commute')).toBeInTheDocument();
    expect(screen.getByText('Plant-Based Choice')).toBeInTheDocument();
  });

  it('renders message bubbles for user and bot', async () => {
    const mockHistory = [
      { role: 'user', content: 'Hello bot' },
      { role: 'bot', content: 'Hello human. <activities>[{"type":"food","desc":"salad","co2_kg":1.2}]</activities>' },
    ];
    (api.fetchChatHistory as any).mockResolvedValue(mockHistory);

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('Hello bot')).toBeInTheDocument();
    });

    // The <activities> block should be parsed and rendered in an ActivityCard badge
    expect(screen.getByText('Hello human.')).toBeInTheDocument();
    expect(screen.getByText('salad')).toBeInTheDocument();
    expect(screen.getByText('1.2 kg CO2')).toBeInTheDocument();
  });

  it('populates typing area when clicking suggestion card', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([]);
    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('Log Transit Commute')).toBeInTheDocument();
    });

    const suggestionBtn = screen.getByText('Log Transit Commute').closest('button');
    expect(suggestionBtn).toBeInTheDocument();
    fireEvent.click(suggestionBtn!);

    // Expect input value to be updated to suggestion prompt
    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    expect(textarea.value).toContain('train instead of driving');
  });

  it('calls clearChatHistory when clicking clear button', async () => {
    const mockHistory = [{ role: 'user', content: 'message' }];
    (api.fetchChatHistory as any).mockResolvedValue(mockHistory);
    (api.clearChatHistory as any).mockResolvedValue({});

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear chat history/i })).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole('button', { name: /clear chat history/i });
    fireEvent.click(clearBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(api.clearChatHistory).toHaveBeenCalled();

    // Verify store has been cleared
    await waitFor(() => {
      expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
    });
  });

  it('simulates streaming response when a user sends a message', async () => {
    (api.fetchChatHistory as any).mockResolvedValue([]);

    // Mock global fetch for stream endpoint
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"chunk": "Hi "}\n'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"chunk": "there"}\n'),
        })
        .mockResolvedValueOnce({
          done: true,
          value: undefined,
        }),
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    } as any);

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask anything...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Ask anything...');
    fireEvent.change(textarea, { target: { value: 'How is the weather?' } });

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    // Verify it posted to endpoint
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    // Check if the chat content was updated with streamed chunks
    await waitFor(() => {
      expect(screen.getByText('Hi there')).toBeInTheDocument();
    });
  });
});
