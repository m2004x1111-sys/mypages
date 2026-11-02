import { getTravelView } from '@lib/travel-map';
import type { createTravelMap } from './map-controller';

type MapController = ReturnType<typeof createTravelMap>;

export function initTravelExplorer() {
  const root = document.querySelector<HTMLElement>('[data-travel-explorer]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-travel-view]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-travel-panel]')];
  let controller: MapController | undefined;
  let pending: Promise<void> | undefined;
  let disposed = false;

  const loadMap = async () => {
    if (controller) {
      controller.refresh();
      return;
    }
    if (pending) return pending;
    pending = (async () => {
      try {
        const { createTravelMap: initialize } = await import('./map-controller');
        if (disposed || root.querySelector<HTMLElement>('[data-travel-panel="map"]')?.hidden) return;
        controller = initialize(root);
      } catch {
        if (disposed) return;
        const status = root.querySelector('[data-map-status]');
        const loading = root.querySelector<HTMLElement>('[data-map-loading]');
        if (loading) loading.hidden = true;
        if (status) status.textContent = '地图暂时没有加载成功，可以切回默认列表，或再次打开地图重试。';
      } finally {
        pending = undefined;
      }
    })();
    return pending;
  };

  const show = (view: 'list' | 'map', updateUrl = false) => {
    buttons.forEach((button) => {
      const selected = button.dataset.travelView === view;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.travelPanel !== view;
    });
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (view === 'map') url.searchParams.set('view', 'map');
      else url.searchParams.delete('view');
      window.history.replaceState(window.history.state, '', url);
    }
    if (view === 'map') void loadMap();
  };
  const click = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('[data-travel-view]');
    if (button) show(button.dataset.travelView === 'map' ? 'map' : 'list', true);
  };
  const keyboard = (event: KeyboardEvent) => {
    if (!(event.target instanceof Element) || !event.target.closest('[role="tablist"]')) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = buttons.findIndex((button) => button.getAttribute('aria-selected') === 'true');
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + 1) % buttons.length;
    const button = buttons[next];
    button.focus();
    show(button.dataset.travelView === 'map' ? 'map' : 'list', true);
  };
  const popState = () => show(getTravelView(window.location.search));
  root.addEventListener('click', click);
  root.addEventListener('keydown', keyboard);
  window.addEventListener('popstate', popState);
  show(getTravelView(window.location.search));
  document.addEventListener(
    'astro:before-swap',
    () => {
      disposed = true;
      controller?.destroy();
      root.removeEventListener('click', click);
      root.removeEventListener('keydown', keyboard);
      window.removeEventListener('popstate', popState);
    },
    { once: true },
  );
}
