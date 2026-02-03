import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioPlayer } from '../audio-player';

describe('AudioPlayer', () => {
  const defaultProps = {
    isPlaying: false,
    isReady: true,
    tempo: 120,
    onPlay: jest.fn(),
    onStop: jest.fn(),
    onTempoChange: jest.fn(),
    onRepeat: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render play button when not playing', () => {
    render(<AudioPlayer {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0]).not.toBeDisabled();
  });

  it('should display the current tempo', () => {
    render(<AudioPlayer {...defaultProps} tempo={140} />);

    expect(screen.getByText('140 BPM')).toBeInTheDocument();
  });

  it('should call onPlay when play button is clicked', async () => {
    const user = userEvent.setup();
    render(<AudioPlayer {...defaultProps} />);

    const playButton = screen.getAllByRole('button')[0];
    await user.click(playButton);

    expect(defaultProps.onPlay).toHaveBeenCalledTimes(1);
  });

  it('should call onStop when stop button is clicked while playing', async () => {
    const user = userEvent.setup();
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);

    const stopButton = screen.getAllByRole('button')[0];
    await user.click(stopButton);

    expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when not ready', () => {
    render(<AudioPlayer {...defaultProps} isReady={false} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('should show "Click para activar audio" message when not ready', () => {
    render(<AudioPlayer {...defaultProps} isReady={false} />);

    expect(screen.getByText('Click para activar audio')).toBeInTheDocument();
  });

  it('should call onRepeat when repeat button is clicked', async () => {
    const user = userEvent.setup();
    render(<AudioPlayer {...defaultProps} />);

    const repeatButton = screen.getAllByRole('button')[1];
    await user.click(repeatButton);

    expect(defaultProps.onRepeat).toHaveBeenCalledTimes(1);
  });

  it('should disable repeat button when playing', () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);

    const repeatButton = screen.getAllByRole('button')[1];
    expect(repeatButton).toBeDisabled();
  });

  it('should not render repeat button when showRepeat is false', () => {
    render(<AudioPlayer {...defaultProps} showRepeat={false} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });

  it('should call onTempoChange when slider value changes', async () => {
    render(<AudioPlayer {...defaultProps} />);

    const slider = screen.getByRole('slider');
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(slider, '140');
    slider.dispatchEvent(new Event('change', { bubbles: true }));

    expect(defaultProps.onTempoChange).toHaveBeenCalled();
  });

  it('should disable slider when playing', () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);

    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should render with correct container styling', () => {
    const { container } = render(<AudioPlayer {...defaultProps} />);

    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('rounded-lg');
    expect(container.firstChild).toHaveClass('border');
  });
});
