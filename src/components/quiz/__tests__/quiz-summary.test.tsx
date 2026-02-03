import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizSummary } from '../quiz-summary';
import { QuizSummaryItem } from '@/types/quiz';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('QuizSummary', () => {
  const mockItems: QuizSummaryItem[] = [
    {
      questionNumber: 1,
      isCorrect: true,
      attemptsUsed: 1,
      progressionName: 'I - IV - V',
      userAnswer: ['I', 'IV', 'V'],
      correctAnswer: ['I', 'IV', 'V'],
    },
    {
      questionNumber: 2,
      isCorrect: false,
      attemptsUsed: 3,
      progressionName: 'ii - V - I',
      userAnswer: ['I', 'V', 'I'],
      correctAnswer: ['ii', 'V', 'I'],
    },
    {
      questionNumber: 3,
      isCorrect: true,
      attemptsUsed: 2,
      songTitle: 'El Gran Varon',
      userAnswer: ['I', 'IV', 'V', 'I'],
      correctAnswer: ['I', 'IV', 'V', 'I'],
    },
  ];

  const defaultProps = {
    items: mockItems,
    totalCorrect: 2,
    totalQuestions: 3,
    genreName: 'Salsa',
    genre: 'salsa',
    mode: 'piano' as const,
    isAuthenticated: false,
    onRestart: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onRestart.mockClear();
  });

  it('should display total score', () => {
    render(<QuizSummary {...defaultProps} />);

    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('should display percentage and genre info', () => {
    render(<QuizSummary {...defaultProps} />);

    expect(screen.getByText('67% de aciertos en Salsa (Piano)')).toBeInTheDocument();
  });

  it('should display grade label based on percentage - excelente', () => {
    render(
      <QuizSummary
        {...defaultProps}
        totalCorrect={9}
        totalQuestions={10}
      />
    );

    expect(screen.getByText('¡Excelente!')).toBeInTheDocument();
  });

  it('should display grade label based on percentage - muy bien', () => {
    render(
      <QuizSummary
        {...defaultProps}
        totalCorrect={7}
        totalQuestions={10}
      />
    );

    expect(screen.getByText('¡Muy bien!')).toBeInTheDocument();
  });

  it('should display grade label based on percentage - buen intento', () => {
    render(
      <QuizSummary
        {...defaultProps}
        totalCorrect={5}
        totalQuestions={10}
      />
    );

    expect(screen.getByText('Buen intento')).toBeInTheDocument();
  });

  it('should display grade label based on percentage - sigue practicando', () => {
    render(
      <QuizSummary
        {...defaultProps}
        totalCorrect={3}
        totalQuestions={10}
      />
    );

    expect(screen.getByText('Sigue practicando')).toBeInTheDocument();
  });

  it('should render summary items', () => {
    render(<QuizSummary {...defaultProps} />);

    expect(screen.getByText('I - IV - V')).toBeInTheDocument();
    expect(screen.getByText('ii - V - I')).toBeInTheDocument();
    expect(screen.getByText('El Gran Varon')).toBeInTheDocument();
  });

  it('should display attempts used for each item', () => {
    render(<QuizSummary {...defaultProps} />);

    expect(screen.getByText(/1 intento/)).toBeInTheDocument();
    expect(screen.getByText(/3 intentos/)).toBeInTheDocument();
    expect(screen.getByText(/2 intentos/)).toBeInTheDocument();
  });

  it('should show login prompt for unauthenticated users', () => {
    render(<QuizSummary {...defaultProps} isAuthenticated={false} />);

    expect(screen.getByText(/Inicia sesi.n/)).toBeInTheDocument();
    expect(screen.getByText(/para guardar tu progreso/)).toBeInTheDocument();
  });

  it('should not show login prompt for authenticated users', () => {
    render(<QuizSummary {...defaultProps} isAuthenticated={true} />);

    expect(screen.queryByText(/Inicia sesi.n/)).not.toBeInTheDocument();
  });

  it('should show profile link for authenticated users', () => {
    render(<QuizSummary {...defaultProps} isAuthenticated={true} />);

    expect(screen.getByText('Ver perfil')).toBeInTheDocument();
  });

  it('should not show profile link for unauthenticated users', () => {
    render(<QuizSummary {...defaultProps} isAuthenticated={false} />);

    expect(screen.queryByText('Ver perfil')).not.toBeInTheDocument();
  });

  it('should call onRestart when restart button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizSummary {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /reiniciar quiz/i }));
    expect(defaultProps.onRestart).toHaveBeenCalledTimes(1);
  });

  it('should have link to genre page', () => {
    render(<QuizSummary {...defaultProps} />);

    const link = screen.getByText(/volver al g.nero/i).closest('a');
    expect(link).toHaveAttribute('href', '/salsa');
  });

  it('should render with repertoire mode label', () => {
    render(<QuizSummary {...defaultProps} mode="repertoire" />);

    expect(screen.getByText(/Repertorio/)).toBeInTheDocument();
  });

  it('should apply green background for correct items', () => {
    const { container } = render(<QuizSummary {...defaultProps} />);

    const greenItems = container.querySelectorAll('.bg-green-500\\/5');
    expect(greenItems.length).toBe(2);
  });

  it('should apply red background for incorrect items', () => {
    const { container } = render(<QuizSummary {...defaultProps} />);

    const redItems = container.querySelectorAll('.bg-red-500\\/5');
    expect(redItems.length).toBe(1);
  });

  it('should display correct answer for each item', () => {
    render(<QuizSummary {...defaultProps} />);

    expect(screen.getByText(/I → IV → V$/)).toBeInTheDocument();
    expect(screen.getByText(/ii → V → I$/)).toBeInTheDocument();
  });
});
