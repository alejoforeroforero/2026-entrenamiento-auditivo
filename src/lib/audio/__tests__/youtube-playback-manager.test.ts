import {
  __resetYouTubePlaybackManagerForTests,
  registerYouTubePlayback,
  unregisterYouTubePlayback,
  requestYouTubePlayback,
  releaseYouTubePlayback,
} from '../youtube-playback-manager';

describe('youtube-playback-manager', () => {
  beforeEach(() => {
    __resetYouTubePlaybackManagerForTests();
  });

  it('pauses the previous player when a new one starts', () => {
    const pauseA = jest.fn();
    const pauseB = jest.fn();

    registerYouTubePlayback('a', pauseA);
    registerYouTubePlayback('b', pauseB);

    requestYouTubePlayback('a');
    requestYouTubePlayback('b');

    expect(pauseA).toHaveBeenCalledTimes(1);
    expect(pauseB).not.toHaveBeenCalled();
  });

  it('does not pause when requesting playback for the same player', () => {
    const pauseA = jest.fn();

    registerYouTubePlayback('a', pauseA);
    requestYouTubePlayback('a');
    requestYouTubePlayback('a');

    expect(pauseA).not.toHaveBeenCalled();
  });

  it('does not pause released players', () => {
    const pauseA = jest.fn();
    const pauseB = jest.fn();

    registerYouTubePlayback('a', pauseA);
    registerYouTubePlayback('b', pauseB);

    requestYouTubePlayback('a');
    releaseYouTubePlayback('a');
    requestYouTubePlayback('b');

    expect(pauseA).not.toHaveBeenCalled();
    expect(pauseB).not.toHaveBeenCalled();
  });

  it('clears active playback when active player is unregistered', () => {
    const pauseA = jest.fn();
    const pauseB = jest.fn();

    registerYouTubePlayback('a', pauseA);
    registerYouTubePlayback('b', pauseB);

    requestYouTubePlayback('a');
    unregisterYouTubePlayback('a');
    requestYouTubePlayback('b');

    expect(pauseA).not.toHaveBeenCalled();
    expect(pauseB).not.toHaveBeenCalled();
  });
});
