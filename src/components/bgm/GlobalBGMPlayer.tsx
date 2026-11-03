/**
 * GlobalBGMPlayer — floating background music player panel.
 *
 * Audio element lives at the component top level (outside AnimatePresence)
 * so that music continues playing when the panel UI is closed.
 * The panel is rendered via AnimatePresence for smooth enter/exit transitions.
 *
 * Local tracks are immediately available; platform playlists resolve on first panel open.
 */

import { LazyMotionProvider } from '@components/common/LazyMotionProvider';
import { PlayerPlaylist, type PlaylistGroup } from '@components/markdown/audio-player/PlayerPlaylist';
import { PlayerPreview } from '@components/markdown/audio-player/PlayerPreview';
import { MediaControls } from '@components/markdown/shared/MediaControls';
import { FloatingFocusManager, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { useBgmAutoplay } from '@hooks/useBgmAutoplay';
import { useIsMounted } from '@hooks/useIsMounted';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useMotionLevel } from '@hooks/useMotionLevel';
import { useTranslation } from '@hooks/useTranslation';
import { Icon } from '@iconify/react';
import type { BgmAudioGroup } from '@lib/config/types';
import type { MetingSong } from '@lib/meting';
import { resolvePlaylist } from '@lib/meting';
import { cn } from '@lib/utils';
import { useStore } from '@nanostores/react';
import { $isAnyModalOpen, $isDrawerOpen } from '@store/modal';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useState } from 'react';
import { $bgmPanelOpen, closeBgmPanel } from '@/store/bgm';
import { bgmWidgetEnabled } from '@/store/settings';

interface GlobalBGMPlayerProps {
  autoplay: boolean;
  localTracks: MetingSong[];
  audioGroups: BgmAudioGroup[];
  metingApi?: string;
}

export default function GlobalBGMPlayer({ autoplay, localTracks, audioGroups, metingApi }: GlobalBGMPlayerProps) {
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const panelOpen = useStore($bgmPanelOpen);
  const widgetEnabled = useStore(bgmWidgetEnabled);
  const isDrawerOpen = useStore($isDrawerOpen);
  const isAnyModalOpen = useStore($isAnyModalOpen);
  const isMobilePlayer = useMediaQuery('(max-width: 600px)');
  const motionDisabled = useMotionLevel() === 'reduced';

  const [tracks, setTracks] = useState<MetingSong[]>(localTracks);
  const [groups, setGroups] = useState<PlaylistGroup[]>([{ startIndex: 0, count: localTracks.length }]);
  const [loading, setLoading] = useState(audioGroups.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  const [playlistRequested, setPlaylistRequested] = useState(autoplay && audioGroups.length > 0);

  useEffect(() => {
    if (panelOpen) setPlaylistRequested(true);
  }, [panelOpen]);

  // Closing the UI must not cancel the first request and leave subsequent openings stuck loading.
  // biome-ignore lint/correctness/useExhaustiveDependencies: retryKey intentionally triggers another request.
  useEffect(() => {
    // Local songs are immediately available, without a music service request.
    if (!playlistRequested) {
      setTracks(localTracks);
      setGroups([{ startIndex: 0, count: localTracks.length }]);
      return;
    }
    let cancelled = false;
    setLoading(audioGroups.length > 0);
    setError(null);

    async function resolve() {
      try {
        const results = await Promise.all(audioGroups.map((group) => resolvePlaylist(group.list, metingApi)));

        if (!cancelled) {
          const allTracks: MetingSong[] = [...localTracks];
          const resolvedGroups: PlaylistGroup[] = localTracks.length ? [{ startIndex: 0, count: localTracks.length }] : [];
          for (let i = 0; i < results.length; i++) {
            const startIndex = allTracks.length;
            allTracks.push(...results[i]);
            resolvedGroups.push({ title: audioGroups[i].title, startIndex, count: results[i].length });
          }
          setTracks(allTracks);
          setGroups(resolvedGroups);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load playlist');
          setLoading(false);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [playlistRequested, localTracks, audioGroups, retryKey, metingApi]);

  // Audio hook at top level — Audio element persists across panel open/close
  const player = useAudioPlayer(tracks);
  useBgmAutoplay({
    enabled: autoplay && widgetEnabled,
    ready: player.ready,
    trackCount: tracks.length,
    playing: player.state.playing,
    error: player.state.error,
    play: player.play,
  });
  const currentTrack = tracks[player.state.currentIndex] ?? null;

  // Hide panel when drawer is open
  const isHidden = isDrawerOpen || isAnyModalOpen || !widgetEnabled;

  // floating-ui: dismiss on ESC / outside click
  const { refs, context } = useFloating({
    open: panelOpen && !isHidden,
    onOpenChange: (open) => {
      if (!open) closeBgmPanel();
    },
  });
  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
    // The header trigger toggles the panel itself; exclude it from outside dismissal.
    outsidePress: (event) => {
      const target = event.target as HTMLElement;
      return !target.closest('[data-bgm-toggle]');
    },
  });
  const role = useRole(context, { role: 'dialog' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  const renderPanelContent = () => {
    if (loading) {
      return (
        <output className="audio-player audio-player-loading bgm-panel-player">
          <div className="audio-player-preview">
            <div className="audio-player-disc-wrapper" aria-hidden="true">
              <div className="bgm-panel-placeholder bgm-panel-placeholder-cover" />
            </div>
            <div className="audio-player-info">
              <div className="audio-player-song-name bgm-panel-loading-label">
                <div className="audio-player-spinner" />
                <span>{t('audio.loading')}</span>
              </div>
              <div className="audio-player-artist" aria-hidden="true">
                <span className="bgm-panel-placeholder bgm-panel-placeholder-artist" />
              </div>
              <div className="audio-player-lrc bgm-panel-placeholder-lyrics" aria-hidden="true">
                {[0, 1, 2].map((line) => (
                  <span key={line} className="bgm-panel-placeholder" />
                ))}
              </div>
            </div>
          </div>
          <div className="audio-player-controls" aria-hidden="true">
            <div className="audio-player-buttons">
              {[0, 1, 2, 3].map((button) => (
                <span key={button} className="bgm-panel-placeholder bgm-panel-placeholder-button" />
              ))}
            </div>
            <div className="audio-player-progress" />
          </div>
          <div className="audio-player-playlist" aria-hidden="true">
            <div className="audio-player-tabs">
              <span className="bgm-panel-placeholder bgm-panel-placeholder-tab" />
              <span className="bgm-panel-placeholder bgm-panel-placeholder-tab" />
            </div>
            <div className="audio-player-song-list bgm-panel-placeholder-list">
              {[0, 1, 2, 3].map((row) => (
                <span key={row} className="bgm-panel-placeholder" />
              ))}
            </div>
          </div>
        </output>
      );
    }

    if (error) {
      return (
        <div className="audio-player audio-player-error bgm-panel-player" role="alert">
          <span>{t('audio.loadError', { error })}</span>
          <button type="button" className="audio-player-btn" onClick={() => setRetryKey((k) => k + 1)}>
            {t('audio.retry')}
          </button>
        </div>
      );
    }

    if (tracks.length === 0) {
      return (
        <div className="audio-player audio-player-empty bgm-panel-player">
          <span>{t('audio.empty')}</span>
        </div>
      );
    }

    return (
      <div className="audio-player not-prose bgm-panel-player bgm-panel-ready">
        <PlayerPreview
          track={currentTrack}
          playing={player.state.playing}
          timeStore={player.timeStore}
          lrcLineHeight={28}
          lrcContainerHeight={isMobilePlayer ? 168 : 140}
          reserveLyrics={Boolean(currentTrack?.lrc)}
        />
        <MediaControls
          playing={player.state.playing}
          loading={player.state.loading}
          mode={player.state.mode}
          volume={player.state.volume}
          muted={player.state.muted}
          timeStore={player.timeStore}
          onTogglePlay={player.togglePlay}
          onPrev={player.prevTrack}
          onNext={player.nextTrack}
          onSeek={player.seek}
          onSetMode={player.setMode}
          onSetVolume={player.setVolume}
          onToggleMute={player.toggleMute}
        />
        <PlayerPlaylist
          tracks={tracks}
          groups={groups}
          currentIndex={player.state.currentIndex}
          timeStore={player.timeStore}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onTrackSelect={player.play}
          onSeek={player.seek}
        />
        {player.state.error && (
          <p className="bgm-playback-error" role="alert">
            {t('audio.playbackError')}
          </p>
        )}
      </div>
    );
  };

  return (
    <LazyMotionProvider>
      <AnimatePresence>
        {isMounted && panelOpen && !isHidden && (
          <FloatingFocusManager key="bgm-panel" context={context} modal={false}>
            <m.div
              ref={refs.setFloating}
              {...getFloatingProps({ 'aria-label': t('floating.bgm') })}
              id="global-bgm-panel"
              className="bgm-panel-position"
              initial={motionDisabled ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={motionDisabled ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={motionDisabled ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
            >
              <div
                className={cn('bgm-panel rounded-2xl shadow-xl', !currentTrack?.lrc && 'bgm-panel-no-lyrics')}
                aria-busy={loading}
              >
                {/* Close button */}
                <button
                  type="button"
                  className="absolute top-2 right-2 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
                  onClick={closeBgmPanel}
                  aria-label={t('audio.closePanel')}
                >
                  <Icon icon="ri:close-line" className="h-4 w-4" />
                </button>
                {renderPanelContent()}
              </div>
            </m.div>
          </FloatingFocusManager>
        )}
      </AnimatePresence>
    </LazyMotionProvider>
  );
}
