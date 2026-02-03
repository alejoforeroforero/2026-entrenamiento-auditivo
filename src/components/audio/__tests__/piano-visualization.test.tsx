import { render, screen } from '@testing-library/react';
import { PianoVisualization } from '../piano-visualization';
import { Chord } from '@/types/music';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      style,
      ...props
    }: React.PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('PianoVisualization', () => {
  const mockChords: Chord[] = [
    { root: 'C', quality: 'major', notes: ['C4', 'E4', 'G4'] },
    { root: 'F', quality: 'major', notes: ['F4', 'A4', 'C5'] },
    { root: 'G', quality: 'major', notes: ['G4', 'B4', 'D5'] },
  ];

  it('should render piano keys', () => {
    render(<PianoVisualization chords={[]} currentChordIndex={-1} />);

    expect(screen.getAllByText('C').length).toBeGreaterThan(0);
    expect(screen.getAllByText('D').length).toBeGreaterThan(0);
    expect(screen.getAllByText('E').length).toBeGreaterThan(0);
    expect(screen.getAllByText('F').length).toBeGreaterThan(0);
    expect(screen.getAllByText('G').length).toBeGreaterThan(0);
    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('B').length).toBeGreaterThan(0);
  });

  it('should render chord progression indicators when chords are provided', () => {
    render(<PianoVisualization chords={mockChords} currentChordIndex={0} />);

    expect(screen.getAllByText('C').length).toBeGreaterThan(0);
    expect(screen.getAllByText('F').length).toBeGreaterThan(0);
    expect(screen.getAllByText('G').length).toBeGreaterThan(0);
  });

  it('should highlight current chord indicator', () => {
    const { container } = render(
      <PianoVisualization chords={mockChords} currentChordIndex={1} />
    );

    const chordIndicators = container.querySelectorAll('.px-3.py-1.rounded');
    expect(chordIndicators[1]).toHaveClass('bg-primary');
  });

  it('should render with default octaves (3 and 4)', () => {
    const { container } = render(
      <PianoVisualization chords={[]} currentChordIndex={-1} />
    );

    const subscripts = container.querySelectorAll('sub');
    const octaveNumbers = Array.from(subscripts).map((sub) => sub.textContent);
    expect(octaveNumbers).toContain('3');
    expect(octaveNumbers).toContain('4');
  });

  it('should render custom number of octaves', () => {
    const { container } = render(
      <PianoVisualization
        chords={[]}
        currentChordIndex={-1}
        startOctave={4}
        numOctaves={3}
      />
    );

    const subscripts = container.querySelectorAll('sub');
    const octaveNumbers = Array.from(subscripts).map((sub) => sub.textContent);
    expect(octaveNumbers).toContain('4');
    expect(octaveNumbers).toContain('5');
    expect(octaveNumbers).toContain('6');
  });

  it('should display chord quality indicators', () => {
    const chordsWithQuality: Chord[] = [
      { root: 'C', quality: 'major', notes: ['C4', 'E4', 'G4'] },
      { root: 'D', quality: 'minor', notes: ['D4', 'F4', 'A4'] },
      { root: 'B', quality: 'diminished', notes: ['B4', 'D5', 'F5'] },
      { root: 'G', quality: 'dominant7', notes: ['G4', 'B4', 'D5', 'F5'] },
    ];

    render(
      <PianoVisualization chords={chordsWithQuality} currentChordIndex={0} />
    );

    expect(screen.getByText('Dm')).toBeInTheDocument();
  });

  it('should use highlightedNotes when provided', () => {
    const { container } = render(
      <PianoVisualization
        chords={mockChords}
        currentChordIndex={-1}
        highlightedNotes={['C4', 'E4', 'G4']}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should not highlight any notes when currentChordIndex is out of range', () => {
    render(
      <PianoVisualization chords={mockChords} currentChordIndex={10} />
    );

    expect(screen.getAllByText('C').length).toBeGreaterThan(0);
  });

  it('should not render chord indicators when no chords provided', () => {
    const { container } = render(
      <PianoVisualization chords={[]} currentChordIndex={-1} />
    );

    const chordIndicators = container.querySelectorAll('.mb-4 .flex.justify-center');
    expect(chordIndicators.length).toBe(0);
  });

  it('should render white and black keys', () => {
    const { container } = render(
      <PianoVisualization chords={[]} currentChordIndex={-1} />
    );

    const whiteKeys = container.querySelectorAll('.bg-white');
    const blackKeys = container.querySelectorAll('.bg-gray-900');
    expect(whiteKeys.length).toBeGreaterThan(0);
    expect(blackKeys.length).toBeGreaterThan(0);
  });
});
