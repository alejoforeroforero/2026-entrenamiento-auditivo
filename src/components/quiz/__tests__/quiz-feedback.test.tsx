import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizFeedback } from '../quiz-feedback';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('QuizFeedback', () => {
  const mockOnRetry = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
    mockOnNext.mockClear();
  });

  it('should not render when show is false', () => {
    render(
      <QuizFeedback
        isCorrect={true}
        attemptsRemaining={3}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={false}
      />
    );

    expect(screen.queryByText('¡Correcto!')).not.toBeInTheDocument();
  });

  it('should not render when isCorrect is null', () => {
    render(
      <QuizFeedback
        isCorrect={null}
        attemptsRemaining={3}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.queryByText('¡Correcto!')).not.toBeInTheDocument();
  });

  it('should render correct feedback when answer is correct', () => {
    render(
      <QuizFeedback
        isCorrect={true}
        attemptsRemaining={2}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('should render retry option when incorrect with attempts remaining', () => {
    render(
      <QuizFeedback
        isCorrect={false}
        attemptsRemaining={2}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.getByText('Incorrecto - Intenta de nuevo')).toBeInTheDocument();
    expect(screen.getByText('Te quedan 2 intentos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('should show singular form for one remaining attempt', () => {
    render(
      <QuizFeedback
        isCorrect={false}
        attemptsRemaining={1}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.getByText('Te quedan 1 intento')).toBeInTheDocument();
  });

  it('should render final incorrect state when no attempts remaining', () => {
    render(
      <QuizFeedback
        isCorrect={false}
        correctAnswer="I -> IV -> V -> I"
        attemptsRemaining={0}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.getByText('Sin intentos')).toBeInTheDocument();
    expect(screen.getByText(/I -> IV -> V -> I/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <QuizFeedback
        isCorrect={false}
        attemptsRemaining={2}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should call onNext when next button is clicked (correct answer)', async () => {
    const user = userEvent.setup();
    render(
      <QuizFeedback
        isCorrect={true}
        attemptsRemaining={2}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('should call onNext when next button is clicked (no attempts left)', async () => {
    const user = userEvent.setup();
    render(
      <QuizFeedback
        isCorrect={false}
        attemptsRemaining={0}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('should apply green styling for correct answer', () => {
    const { container } = render(
      <QuizFeedback
        isCorrect={true}
        attemptsRemaining={2}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(container.firstChild).toHaveClass('bg-green-500/10');
  });

  it('should apply amber styling when can retry', () => {
    const { container } = render(
      <QuizFeedback
        isCorrect={false}
        attemptsRemaining={2}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(container.firstChild).toHaveClass('bg-amber-500/10');
  });

  it('should apply red styling when no attempts remaining', () => {
    const { container } = render(
      <QuizFeedback
        isCorrect={false}
        attemptsRemaining={0}
        onRetry={mockOnRetry}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(container.firstChild).toHaveClass('bg-red-500/10');
  });
});
