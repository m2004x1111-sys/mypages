import { bgmConfig } from '@constants/site-config';
import { useIsMounted } from '@hooks/useIsMounted';
import { useTranslation } from '@hooks/useTranslation';
import { Icon } from '@iconify/react';
import { cn } from '@lib/utils';
import { useStore } from '@nanostores/react';
import { $bgmPanelOpen, toggleBgmPanel } from '@store/bgm';
import { bgmWidgetEnabled } from '@store/settings';

/** Header entry point; audio remains in the separately persisted global player. */
export function MusicTrigger() {
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const panelOpen = useStore($bgmPanelOpen);
  const enabled = useStore(bgmWidgetEnabled);
  if (!bgmConfig.enabled || (!bgmConfig.audio.length && !bgmConfig.tracks.length) || (isMounted && !enabled)) return null;

  return (
    <button
      type="button"
      onClick={toggleBgmPanel}
      className={cn(
        'size-10 flex-center cursor-pointer rounded-full transition-[background-color,scale] duration-200 ease-out-quart hover:bg-current/15 active:scale-90',
        isMounted && panelOpen && 'bg-current/15',
      )}
      aria-label={t('floating.bgm')}
      title={isMounted ? t('floating.bgm') : undefined}
      aria-expanded={isMounted && panelOpen}
      aria-controls="global-bgm-panel"
      aria-haspopup="dialog"
      data-bgm-toggle
    >
      <Icon icon="ri:music-2-line" className="size-7" />
    </button>
  );
}
