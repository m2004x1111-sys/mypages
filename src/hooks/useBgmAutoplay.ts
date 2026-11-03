import { useEffect, useRef } from 'react';

interface BgmAutoplayOptions {
  enabled: boolean;
  ready: boolean;
  trackCount: number;
  playing: boolean;
  error: string | null;
  play: (index?: number) => void;
}

/** Try once on entry, then use a trusted interaction if audible autoplay was blocked. */
export function useBgmAutoplay({ enabled, ready, trackCount, playing, error, play }: BgmAutoplayOptions) {
  const attempted = useRef(false);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (playing) hasPlayed.current = true;
  }, [playing]);

  useEffect(() => {
    if (!enabled || !ready || !trackCount || attempted.current) return;
    attempted.current = true;
    play(0);
  }, [enabled, ready, trackCount, play]);

  useEffect(() => {
    if (!enabled || !ready || !trackCount || playing || error || hasPlayed.current) return;

    const onInteraction = (event: MouseEvent | KeyboardEvent) => {
      if (!event.isTrusted || event.defaultPrevented) return;
      if (event instanceof KeyboardEvent && (event.repeat || (event.key !== 'Enter' && event.key !== ' '))) return;
      // Explicit media controls own their click/keyboard behavior. Avoid double play or overriding a selected song.
      if (event.target instanceof Element && event.target.closest('.audio-player, .video-player, audio, video')) return;
      play();
    };
    document.addEventListener('click', onInteraction, true);
    document.addEventListener('keydown', onInteraction, true);
    return () => {
      document.removeEventListener('click', onInteraction, true);
      document.removeEventListener('keydown', onInteraction, true);
    };
  }, [enabled, ready, trackCount, playing, error, play]);
}
