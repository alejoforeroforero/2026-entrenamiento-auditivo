type PauseHandler = () => void;

const pauseHandlers = new Map<string, PauseHandler>();
let activePlaybackId: string | null = null;

export function registerYouTubePlayback(id: string, onPause: PauseHandler) {
  pauseHandlers.set(id, onPause);
}

export function unregisterYouTubePlayback(id: string) {
  pauseHandlers.delete(id);
  if (activePlaybackId === id) {
    activePlaybackId = null;
  }
}

export function requestYouTubePlayback(id: string) {
  if (activePlaybackId && activePlaybackId !== id) {
    pauseHandlers.get(activePlaybackId)?.();
  }
  activePlaybackId = id;
}

export function releaseYouTubePlayback(id: string) {
  if (activePlaybackId === id) {
    activePlaybackId = null;
  }
}

export function __resetYouTubePlaybackManagerForTests() {
  pauseHandlers.clear();
  activePlaybackId = null;
}
