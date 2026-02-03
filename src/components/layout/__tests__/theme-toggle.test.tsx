import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../theme-toggle';

describe('ThemeToggle', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  const mockClassList = {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    toggle: jest.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      configurable: true,
    });
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
  });

  it('should render toggle button', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('should render as visible after mount', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeVisible();
    });
  });

  it('should have accessible label', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggle theme');
    });
  });

  it('should default to dark theme', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });
  });

  it('should set light theme if stored', async () => {
    mockLocalStorage.getItem.mockReturnValue('light');
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(mockClassList.remove).toHaveBeenCalledWith('dark');
    });
  });

  it('should toggle from dark to light on click', async () => {
    const user = userEvent.setup();
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button'));

    expect(mockClassList.remove).toHaveBeenCalledWith('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should toggle from light to dark on click', async () => {
    const user = userEvent.setup();
    mockLocalStorage.getItem.mockReturnValue('light');
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button'));

    expect(mockClassList.add).toHaveBeenCalledWith('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should render with correct styling', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('relative');
      expect(button).toHaveClass('w-14');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('rounded-full');
    });
  });

  it('should have toggle indicator', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      const indicator = button.querySelector('span');
      expect(indicator).toHaveClass('rounded-full');
      expect(indicator).toHaveClass('bg-foreground');
    });
  });
});
