import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizModeSelector } from '../quiz-mode-selector';

describe('QuizModeSelector', () => {
  const mockOnSelectMode = jest.fn();

  beforeEach(() => {
    mockOnSelectMode.mockClear();
  });

  it('should render quiz title', () => {
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    expect(screen.getByText('Quiz de Progresiones')).toBeInTheDocument();
  });

  it('should render genre name when provided', () => {
    render(
      <QuizModeSelector
        onSelectMode={mockOnSelectMode}
        genreName="Salsa"
      />
    );

    expect(screen.getByText('Salsa')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    expect(
      screen.getByText(/Pon a prueba tu o.do identificando progresiones arm.nicas/)
    ).toBeInTheDocument();
  });

  it('should render piano mode card', () => {
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    expect(screen.getByText('Modo Piano')).toBeInTheDocument();
    expect(
      screen.getByText(/Escucha la progresi.n sintetizada e identifica los acordes/)
    ).toBeInTheDocument();
  });

  it('should render repertoire mode card', () => {
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    expect(screen.getByText('Modo Repertorio')).toBeInTheDocument();
    expect(
      screen.getByText(/Escucha fragmentos de canciones reales e identifica la progresi.n/)
    ).toBeInTheDocument();
  });

  it('should render quiz info', () => {
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    expect(screen.getByText(/10 preguntas.*3 intentos por pregunta/)).toBeInTheDocument();
  });

  it('should call onSelectMode with "piano" when piano button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    const comenzarButtons = screen.getAllByRole('button', { name: /comenzar/i });
    await user.click(comenzarButtons[0]);

    expect(mockOnSelectMode).toHaveBeenCalledWith('piano');
  });

  it('should call onSelectMode with "repertoire" when repertoire button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    const comenzarButtons = screen.getAllByRole('button', { name: /comenzar/i });
    await user.click(comenzarButtons[1]);

    expect(mockOnSelectMode).toHaveBeenCalledWith('repertoire');
  });

  it('should render comenzar buttons', () => {
    render(<QuizModeSelector onSelectMode={mockOnSelectMode} />);

    const comenzarButtons = screen.getAllByRole('button', { name: /comenzar/i });
    expect(comenzarButtons).toHaveLength(2);
  });

  it('should show loading state when isLoading is true', () => {
    render(
      <QuizModeSelector
        onSelectMode={mockOnSelectMode}
        isLoading={true}
      />
    );

    const loadingButtons = screen.getAllByText(/cargando/i);
    expect(loadingButtons).toHaveLength(2);
    loadingButtons.forEach((button) => {
      expect(button.closest('button')).toBeDisabled();
    });
  });

  it('should disable cards when loading', () => {
    const { container } = render(
      <QuizModeSelector
        onSelectMode={mockOnSelectMode}
        isLoading={true}
      />
    );

    const cards = container.querySelectorAll('.opacity-50');
    expect(cards.length).toBe(2);
  });

  it('should not call onSelectMode when loading', async () => {
    const user = userEvent.setup();
    render(
      <QuizModeSelector
        onSelectMode={mockOnSelectMode}
        isLoading={true}
      />
    );

    const loadingButton = screen.getAllByText(/cargando/i)[0].closest('button');
    await user.click(loadingButton!);

    expect(mockOnSelectMode).not.toHaveBeenCalled();
  });

  it('should render mode cards in a grid', () => {
    const { container } = render(
      <QuizModeSelector onSelectMode={mockOnSelectMode} />
    );

    const grid = container.querySelector('.grid.gap-4');
    expect(grid).toBeInTheDocument();
  });
});
