import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Challenges } from '../pages/Challenges';
import * as api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

vi.mock('../lib/api', () => ({
  fetchLeaderboard: vi.fn(),
}));

describe('Challenges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockUser = (userId = 'user-1') => {
    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2026-06-20T00:00:00.000Z',
    };
    return mockUser;
  };

  const setupMockLeaderboard = (rankings = []) => {
    const mockData = {
      rankings: rankings.length
        ? rankings
        : [
            {
              userId: 'user-2',
              name: 'Leader User',
              weeklyFootprint: 10,
              totalFootprint: 50,
              activityCount: 5,
              rank: 1,
            },
            {
              userId: 'user-1',
              name: 'Test User',
              weeklyFootprint: 20,
              totalFootprint: 80,
              activityCount: 10,
              rank: 2,
            },
            {
              userId: 'user-3',
              name: 'Third User',
              weeklyFootprint: 30,
              totalFootprint: 90,
              activityCount: 4,
              rank: 3,
            },
          ],
      challenges: [
        {
          id: '1',
          title: 'Carpool Challenge',
          description: 'Take transit',
          target: 5,
          category: 'transport',
          points: 100,
        },
      ],
    };
    vi.mocked(api.fetchLeaderboard).mockResolvedValue(mockData);
    return mockData;
  };

  it('renders loader while fetching data', () => {
    vi.mocked(api.fetchLeaderboard).mockReturnValue(new Promise(() => {}));
    const mockUser = setupMockUser();

    render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          isAuthenticated: true,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          checkAuth: vi.fn(),
          updateProfile: vi.fn(),
          updatePassword: vi.fn(),
          loading: false,
        }}
      >
        <Challenges />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/loading community stats/i)).toBeInTheDocument();
  });

  it('renders podium ranks, user position, active challenges, and table correctly', async () => {
    setupMockLeaderboard();
    const mockUser = setupMockUser();

    render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          isAuthenticated: true,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          checkAuth: vi.fn(),
          updateProfile: vi.fn(),
          updatePassword: vi.fn(),
          loading: false,
        }}
      >
        <Challenges />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Leader User')).toBeInTheDocument();
    });

    // Check podium ranks
    expect(screen.getByText('1st Place')).toBeInTheDocument();
    expect(screen.getByText('2nd Place')).toBeInTheDocument();
    expect(screen.getByText('3rd Place')).toBeInTheDocument();

    // Check user ranking status card
    expect(screen.getByText('Rank #2')).toBeInTheDocument();

    // Check active challenges list
    expect(screen.getByText('Carpool Challenge')).toBeInTheDocument();
    expect(screen.getByText('+100 pts')).toBeInTheDocument();

    // Check table rankings
    expect(screen.getByText('Leader User')).toBeInTheDocument();
    expect(screen.getByText('Third User')).toBeInTheDocument();
  });

  it('renders error block and triggers retry fetch on click', async () => {
    vi.mocked(api.fetchLeaderboard).mockRejectedValueOnce(new Error('Fetch failed'));
    vi.mocked(api.fetchLeaderboard).mockResolvedValueOnce({ rankings: [], challenges: [] });
    const mockUser = setupMockUser();

    render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          isAuthenticated: true,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          checkAuth: vi.fn(),
          updateProfile: vi.fn(),
          updatePassword: vi.fn(),
          loading: false,
        }}
      >
        <Challenges />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading leaderboard')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByText('Error loading leaderboard')).not.toBeInTheDocument();
    });
  });
});
