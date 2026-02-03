import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnswerOptions } from '../answer-options';
import { ExerciseOption } from '@/types/music';

jest.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      disabled,
      onClick,
      className,
      whileHover: _whileHover,
      whileTap: _whileTap,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...rest
    }: React.PropsWithChildren<{
      disabled?: boolean;
      onClick?: () => void;
      className?: string;
      whileHover?: unknown;
      whileTap?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }>) => (
      <button disabled={disabled} onClick={onClick} className={className} {...rest}>
        {children}
      </button>
    ),
    div: ({
      children,
      className,
      initial: _initial,
      animate: _animate,
      transition: _transition,
    }: React.PropsWithChildren<{
      className?: string;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }>) => (
      <div className={className}>{children}</div>
    ),
  },
}));

describe('AnswerOptions', () => {
  const mockOptions: ExerciseOption[] = [
    { id: '1', label: 'I - IV - V', value: 'progression-1', correct: true },
    { id: '2', label: 'I - V - vi - IV', value: 'progression-2', correct: false },
    { id: '3', label: 'ii - V - I', value: 'progression-3', correct: false },
    { id: '4', label: 'I - vi - IV - V', value: 'progression-4', correct: false },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render all options', () => {
    render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer={null}
        isAnswered={false}
        onSelect={mockOnSelect}
      />
    );

    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('should call onSelect when an option is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer={null}
        isAnswered={false}
        onSelect={mockOnSelect}
      />
    );

    await user.click(screen.getByText('I - IV - V'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('should not call onSelect when disabled', async () => {
    const user = userEvent.setup();
    render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer={null}
        isAnswered={false}
        onSelect={mockOnSelect}
        disabled={true}
      />
    );

    await user.click(screen.getByText('I - IV - V'));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should not call onSelect when already answered', async () => {
    const user = userEvent.setup();
    render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer="1"
        isAnswered={true}
        onSelect={mockOnSelect}
      />
    );

    await user.click(screen.getByText('I - V - vi - IV'));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should highlight selected answer', () => {
    const { container } = render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer="1"
        isAnswered={false}
        onSelect={mockOnSelect}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons[0]).toHaveClass('border-primary');
  });

  it('should show correct/incorrect indicators when answered', () => {
    render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer="2"
        isAnswered={true}
        onSelect={mockOnSelect}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('border-green-500');
    expect(buttons[1]).toHaveClass('border-red-500');
  });

  it('should disable all buttons when answered', () => {
    render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer="1"
        isAnswered={true}
        onSelect={mockOnSelect}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should render options in a grid layout', () => {
    const { container } = render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer={null}
        isAnswered={false}
        onSelect={mockOnSelect}
      />
    );

    expect(container.firstChild).toHaveClass('grid');
    expect(container.firstChild).toHaveClass('grid-cols-2');
  });

  it('should apply opacity to non-correct wrong answers when showing results', () => {
    render(
      <AnswerOptions
        options={mockOptions}
        selectedAnswer="1"
        isAnswered={true}
        onSelect={mockOnSelect}
      />
    );

    const wrongOptions = screen.getAllByRole('button').filter(
      (_, index) => index !== 0
    );
    wrongOptions.forEach((button) => {
      expect(button).toHaveClass('opacity-50');
    });
  });
});
