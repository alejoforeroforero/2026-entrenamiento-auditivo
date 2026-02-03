import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Feedback } from '../feedback';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('Feedback', () => {
  const mockOnNext = jest.fn();

  beforeEach(() => {
    mockOnNext.mockClear();
  });

  it('should not render when show is false', () => {
    render(
      <Feedback
        isCorrect={true}
        onNext={mockOnNext}
        show={false}
      />
    );

    expect(screen.queryByText('Correcto')).not.toBeInTheDocument();
    expect(screen.queryByText('Incorrecto')).not.toBeInTheDocument();
  });

  it('should not render when isCorrect is null', () => {
    render(
      <Feedback
        isCorrect={null}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.queryByText('Correcto')).not.toBeInTheDocument();
  });

  it('should render correct feedback when answer is correct', () => {
    render(
      <Feedback
        isCorrect={true}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('should render incorrect feedback with correct answer when wrong', () => {
    render(
      <Feedback
        isCorrect={false}
        correctAnswer="I - IV - V"
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.getByText('Incorrecto')).toBeInTheDocument();
    expect(screen.getByText(/I - IV - V/)).toBeInTheDocument();
    expect(screen.getByText(/La respuesta correcta era:/)).toBeInTheDocument();
  });

  it('should render explanation when provided', () => {
    const explanation = 'Esta progresion es tipica de la salsa';
    render(
      <Feedback
        isCorrect={true}
        explanation={explanation}
        onNext={mockOnNext}
        show={true}
      />
    );

    expect(screen.getByText(explanation)).toBeInTheDocument();
  });

  it('should call onNext when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Feedback
        isCorrect={true}
        onNext={mockOnNext}
        show={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('should apply correct styling for correct answer', () => {
    const { container } = render(
      <Feedback
        isCorrect={true}
        onNext={mockOnNext}
        show={true}
      />
    );

    const feedbackDiv = container.firstChild as HTMLElement;
    expect(feedbackDiv).toHaveClass('bg-green-500/10');
  });

  it('should apply incorrect styling for wrong answer', () => {
    const { container } = render(
      <Feedback
        isCorrect={false}
        onNext={mockOnNext}
        show={true}
      />
    );

    const feedbackDiv = container.firstChild as HTMLElement;
    expect(feedbackDiv).toHaveClass('bg-red-500/10');
  });
});
