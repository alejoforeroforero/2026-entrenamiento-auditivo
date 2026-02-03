import { render, screen } from '@testing-library/react';
import { QuizProgress } from '../quiz-progress';

describe('QuizProgress', () => {
  it('should display current question number and total', () => {
    render(<QuizProgress current={3} total={10} correct={2} />);

    expect(screen.getByText('Pregunta 3 de 10')).toBeInTheDocument();
  });

  it('should display correct answer count with singular form', () => {
    render(<QuizProgress current={2} total={10} correct={1} />);

    expect(screen.getByText('1 correcta')).toBeInTheDocument();
  });

  it('should display correct answer count with plural form', () => {
    render(<QuizProgress current={5} total={10} correct={3} />);

    expect(screen.getByText('3 correctas')).toBeInTheDocument();
  });

  it('should display zero correct answers', () => {
    render(<QuizProgress current={1} total={10} correct={0} />);

    expect(screen.getByText('0 correctas')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    const { container } = render(
      <QuizProgress current={5} total={10} correct={3} />
    );

    const progressBar = container.querySelector('.bg-secondary');
    expect(progressBar).toBeInTheDocument();
  });

  it('should calculate progress percentage correctly at start', () => {
    const { container } = render(
      <QuizProgress current={1} total={10} correct={0} />
    );

    const progressFill = container.querySelector('.bg-primary');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  it('should calculate progress percentage correctly at midpoint', () => {
    const { container } = render(
      <QuizProgress current={6} total={10} correct={3} />
    );

    const progressFill = container.querySelector('.bg-primary');
    expect(progressFill).toHaveStyle({ width: '50%' });
  });

  it('should calculate progress percentage correctly at end', () => {
    const { container } = render(
      <QuizProgress current={11} total={10} correct={8} />
    );

    const progressFill = container.querySelector('.bg-primary');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });

  it('should handle edge case of 1 question total', () => {
    render(<QuizProgress current={1} total={1} correct={0} />);

    expect(screen.getByText('Pregunta 1 de 1')).toBeInTheDocument();
  });

  it('should render with correct layout structure', () => {
    const { container } = render(
      <QuizProgress current={3} total={10} correct={2} />
    );

    expect(container.firstChild).toHaveClass('space-y-1');
    expect(container.querySelector('.flex.items-center.justify-between')).toBeInTheDocument();
  });
});
