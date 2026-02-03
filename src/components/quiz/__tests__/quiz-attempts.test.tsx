import { render, screen } from '@testing-library/react';
import { QuizAttempts } from '../quiz-attempts';

describe('QuizAttempts', () => {
  it('should display "Intentos:" label', () => {
    render(<QuizAttempts used={0} max={3} />);

    expect(screen.getByText('Intentos:')).toBeInTheDocument();
  });

  it('should display remaining attempts with plural form', () => {
    render(<QuizAttempts used={0} max={3} />);

    expect(screen.getByText('(3 restantes)')).toBeInTheDocument();
  });

  it('should display remaining attempts with singular form', () => {
    render(<QuizAttempts used={2} max={3} />);

    expect(screen.getByText('(1 restante)')).toBeInTheDocument();
  });

  it('should display zero remaining attempts', () => {
    render(<QuizAttempts used={3} max={3} />);

    expect(screen.getByText('(0 restantes)')).toBeInTheDocument();
  });

  it('should render correct number of dots', () => {
    const { container } = render(<QuizAttempts used={0} max={3} />);

    const dots = container.querySelectorAll('.rounded-full.transition-colors');
    expect(dots).toHaveLength(3);
  });

  it('should render correct number of dots for custom max', () => {
    const { container } = render(<QuizAttempts used={0} max={5} />);

    const dots = container.querySelectorAll('.rounded-full.transition-colors');
    expect(dots).toHaveLength(5);
  });

  it('should show all dots as primary when no attempts used', () => {
    const { container } = render(<QuizAttempts used={0} max={3} />);

    const primaryDots = container.querySelectorAll('.bg-primary');
    expect(primaryDots).toHaveLength(3);
  });

  it('should show correct number of used dots', () => {
    const { container } = render(<QuizAttempts used={2} max={3} />);

    const primaryDots = container.querySelectorAll('.bg-primary');
    const mutedDots = container.querySelectorAll('.bg-muted');
    expect(primaryDots).toHaveLength(1);
    expect(mutedDots).toHaveLength(2);
  });

  it('should show all dots as muted when all attempts used', () => {
    const { container } = render(<QuizAttempts used={3} max={3} />);

    const mutedDots = container.querySelectorAll('.bg-muted');
    expect(mutedDots).toHaveLength(3);
  });

  it('should have correct dot sizes', () => {
    const { container } = render(<QuizAttempts used={0} max={3} />);

    const dots = container.querySelectorAll('.w-2\\.5.h-2\\.5');
    expect(dots).toHaveLength(3);
  });

  it('should render with flex layout', () => {
    const { container } = render(<QuizAttempts used={0} max={3} />);

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('items-center');
  });
});
