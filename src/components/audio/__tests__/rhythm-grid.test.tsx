import { render, screen } from '@testing-library/react';
import { RhythmGrid } from '../rhythm-grid';
import { RhythmPattern } from '@/types/music';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('RhythmGrid', () => {
  const mockPattern: RhythmPattern = {
    id: 'test-pattern',
    name: 'Cumbia Basica',
    genre: 'cumbia',
    timeSignature: [4, 4],
    bpm: 100,
    instruments: [
      {
        instrument: 'guira',
        pattern: Array.from({ length: 16 }, (_, i) => ({
          beat: Math.floor(i / 4),
          subdivision: i % 4,
          active: i % 2 === 0,
          accent: i % 4 === 0,
        })),
      },
      {
        instrument: 'tambora',
        pattern: Array.from({ length: 16 }, (_, i) => ({
          beat: Math.floor(i / 4),
          subdivision: i % 4,
          active: i % 4 === 0,
          accent: false,
        })),
      },
    ],
    description: 'Patron basico de cumbia',
  };

  it('should render pattern name', () => {
    render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    expect(screen.getByText('Cumbia Basica')).toBeInTheDocument();
  });

  it('should display time signature and BPM', () => {
    render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    expect(screen.getByText('4/4 • 100 BPM')).toBeInTheDocument();
  });

  it('should render instrument labels', () => {
    render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    expect(screen.getByText(/G.ira/)).toBeInTheDocument();
    expect(screen.getByText('Tambora')).toBeInTheDocument();
  });

  it('should render beat markers', () => {
    render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should highlight current step when playing', () => {
    const { container } = render(
      <RhythmGrid pattern={mockPattern} currentStep={2} isPlaying={true} />
    );

    const highlightedSteps = container.querySelectorAll('.ring-primary');
    expect(highlightedSteps.length).toBeGreaterThan(0);
  });

  it('should not highlight steps when not playing', () => {
    const { container } = render(
      <RhythmGrid pattern={mockPattern} currentStep={2} isPlaying={false} />
    );

    const highlightedSteps = container.querySelectorAll('.ring-primary');
    expect(highlightedSteps.length).toBe(0);
  });

  it('should render active steps with instrument-specific colors', () => {
    const { container } = render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    expect(container.querySelector('.bg-amber-500')).toBeInTheDocument();
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
  });

  it('should render inactive steps with muted background', () => {
    const { container } = render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    expect(container.querySelector('.bg-muted')).toBeInTheDocument();
  });

  it('should render correct number of steps per instrument', () => {
    const { container } = render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    const stepRows = container.querySelectorAll('.flex.gap-1');
    expect(stepRows.length).toBeGreaterThan(0);
  });

  it('should handle different time signatures', () => {
    const pattern3_4: RhythmPattern = {
      ...mockPattern,
      timeSignature: [3, 4],
      instruments: [
        {
          instrument: 'guira',
          pattern: Array.from({ length: 12 }, (_, i) => ({
            beat: Math.floor(i / 4),
            subdivision: i % 4,
            active: i % 2 === 0,
          })),
        },
      ],
    };

    render(
      <RhythmGrid pattern={pattern3_4} currentStep={0} isPlaying={false} />
    );

    expect(screen.getByText('3/4 • 100 BPM')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('should apply accent styling to accented steps', () => {
    const { container } = render(
      <RhythmGrid pattern={mockPattern} currentStep={0} isPlaying={false} />
    );

    const accentedSteps = container.querySelectorAll('.ring-white');
    expect(accentedSteps.length).toBeGreaterThan(0);
  });
});
