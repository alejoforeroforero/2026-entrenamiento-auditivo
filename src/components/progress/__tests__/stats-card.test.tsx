import { render, screen } from '@testing-library/react';
import { StatsCard } from '../stats-card';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('StatsCard', () => {
  it('should render title', () => {
    render(<StatsCard title="Total Ejercicios" value={42} />);

    expect(screen.getByText('Total Ejercicios')).toBeInTheDocument();
  });

  it('should render numeric value', () => {
    render(<StatsCard title="Ejercicios" value={100} />);

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render string value', () => {
    render(<StatsCard title="Precision" value="85%" />);

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <StatsCard
        title="Racha"
        value={5}
        subtitle="Mejor racha: 10"
      />
    );

    expect(screen.getByText('Mejor racha: 10')).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    const { container } = render(<StatsCard title="Test" value={1} />);

    const subtitle = container.querySelector('.text-xs.text-muted-foreground.mt-1');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const TestIcon = () => <svg data-testid="test-icon" />;
    render(<StatsCard title="Test" value={1} icon={<TestIcon />} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should not render icon container when not provided', () => {
    const { container } = render(<StatsCard title="Test" value={1} />);

    const iconContainer = container.querySelector('.text-muted-foreground');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should render up trend indicator', () => {
    render(<StatsCard title="Precision" value="90%" trend="up" />);

    const trendIndicator = screen.getByText('↑');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveClass('text-green-500');
  });

  it('should render down trend indicator', () => {
    render(<StatsCard title="Precision" value="70%" trend="down" />);

    const trendIndicator = screen.getByText('↓');
    expect(trendIndicator).toBeInTheDocument();
    expect(trendIndicator).toHaveClass('text-red-500');
  });

  it('should render neutral trend without arrow', () => {
    render(<StatsCard title="Precision" value="80%" trend="neutral" />);

    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatsCard title="Test" value={1} className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should render with card structure', () => {
    const { container } = render(<StatsCard title="Test" value={1} />);

    expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
  });

  it('should display title with correct styling', () => {
    render(<StatsCard title="Test Title" value={1} />);

    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('text-sm');
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('text-muted-foreground');
  });

  it('should display value with correct styling', () => {
    render(<StatsCard title="Test" value={42} />);

    const value = screen.getByText('42');
    expect(value).toHaveClass('text-2xl');
    expect(value).toHaveClass('font-bold');
  });
});
