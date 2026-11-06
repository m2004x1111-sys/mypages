/** Interactions for the card collection only; illustration galleries keep their own lightbox. */
export function initCardArtGallery() {
  const root = document.querySelector<HTMLElement>('[data-card-gallery]');
  if (!root || root.dataset.ready) return;
  const dialog = root.querySelector<HTMLDialogElement>('[data-card-dialog]');
  const preview = root.querySelector<HTMLImageElement>('[data-card-preview]');
  const previewButton = root.querySelector<HTMLButtonElement>('[data-card-lightbox-toggle]');
  const previewFlash = root.querySelector<HTMLElement>('[data-card-preview-flash]');
  const title = root.querySelector<HTMLElement>('#card-lightbox-title');
  const note = root.querySelector<HTMLElement>('[data-card-lightbox-note]');
  const hint = root.querySelector<HTMLElement>('[data-card-lightbox-hint]');
  const source = root.querySelector<HTMLAnchorElement>('[data-card-lightbox-source]');
  const count = root.querySelector<HTMLElement>('[data-card-lightbox-count]');
  const status = root.querySelector<HTMLElement>('[data-card-status]');
  if (!dialog || !preview || !previewButton || !previewFlash || !title || !note || !hint || !source || !count || !status)
    return;
  root.dataset.ready = 'true';

  const figures = [...root.querySelectorAll<HTMLElement>('[data-card-item]')];
  const animations = new Set<Animation>();
  const busy = new Set<HTMLElement>();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = figures;
  let active: HTMLElement | undefined;
  let disposed = false;

  const renderPreview = () => {
    if (!active) return;
    const back = active.dataset.face === 'back';
    const paired = !!active.dataset.backPreview;
    preview.src = (back ? active.dataset.backPreview : active.dataset.frontPreview) ?? '';
    preview.alt = `${active.dataset.title ?? ''}${paired ? (back ? ' · 花后' : ' · 花前') : ''}`;
    title.textContent = active.dataset.title ?? '';
    note.textContent = active.dataset.note ?? '';
    hint.textContent = paired ? `当前为 ${back ? '花后' : '花前'}   ` : '';
    previewButton.disabled = !paired;
    previewButton.setAttribute('aria-label', paired ? `${active.dataset.title}：切换到花${back ? '前' : '后'}` : preview.alt);
    if (paired) previewButton.setAttribute('aria-pressed', String(back));
    else previewButton.removeAttribute('aria-pressed');
    source.href = (back ? active.dataset.backSource : active.dataset.frontSource) ?? '';
    source.textContent = active.dataset.sourceLabel || '查看原图 ↗';
    count.textContent = `${visible.indexOf(active) + 1} / ${visible.length}`;
  };

  const animateOpacity = (element: HTMLElement, from: number, to: number, duration: number) => {
    const animation = element.animate([{ opacity: from }, { opacity: to }], { duration, easing: 'ease-out', fill: 'forwards' });
    animations.add(animation);
    return animation;
  };

  const flip = async (figure: HTMLElement) => {
    if (!figure.dataset.backPreview || busy.has(figure)) return;
    const button = figure.querySelector<HTMLButtonElement>('[data-card-toggle]');
    const flash = figure.querySelector<HTMLElement>('[data-card-flash]');
    const back = figure.dataset.face !== 'back';
    const target = figure.querySelector<HTMLImageElement>(back ? '[data-card-back]' : '[data-card-front]');
    if (!button || !flash || !target) return;
    busy.add(figure);
    button.setAttribute('aria-busy', 'true');
    status.textContent = '';
    const ownAnimations: Animation[] = [];
    const cancelAnimations = () => {
      for (const animation of ownAnimations) {
        animation.cancel();
        animations.delete(animation);
      }
    };
    try {
      // Decode the next image before flashing, so a slow connection cannot leave a blank card.
      target.loading = 'eager';
      await target.decode();
      const previewing = dialog.open && active === figure;
      if (previewing) {
        const next = new Image();
        next.src = (back ? figure.dataset.backPreview : figure.dataset.frontPreview) ?? '';
        await next.decode();
      }
      if (disposed || !figure.isConnected) return;
      const flashes = [flash, ...(dialog.open && active === figure ? [previewFlash] : [])];
      if (!reducedMotion.matches) {
        const fadeIn = flashes.map((element) => animateOpacity(element, 0, 1, 130));
        ownAnimations.push(...fadeIn);
        await Promise.all(fadeIn.map((animation) => animation.finished));
      }
      if (disposed) return;
      figure.dataset.face = back ? 'back' : 'front';
      button.setAttribute('aria-pressed', String(back));
      button.setAttribute('aria-label', `${figure.dataset.title}：切换到第${back ? '一' : '二'}张卡面`);
      figure.querySelector('[data-card-front]')?.setAttribute('aria-hidden', String(back));
      figure.querySelector('[data-card-back]')?.setAttribute('aria-hidden', String(!back));
      const faceLabel = figure.querySelector('[data-card-face-label]');
      if (faceLabel) faceLabel.textContent = `${back ? '02' : '01'} / 02`;
      if (dialog.open && active === figure) {
        renderPreview();
        await preview.decode();
      }
      if (!disposed) {
        status.textContent = `${figure.dataset.title}：花${back ? '前' : '后'}`;
        if (!reducedMotion.matches) {
          const fadeOut = flashes.map((element) => animateOpacity(element, 1, 0, 300));
          ownAnimations.push(...fadeOut);
          await Promise.all(fadeOut.map((animation) => animation.finished));
        }
      }
    } catch (error) {
      if (!disposed && !(error instanceof DOMException && error.name === 'AbortError')) {
        status.textContent = '卡面失踪了';
      }
    } finally {
      cancelAnimations();
      button.removeAttribute('aria-busy');
      busy.delete(figure);
    }
  };

  const openPreview = (figure: HTMLElement) => {
    if (busy.has(figure)) return;
    active = figure;
    renderPreview();
    dialog.showModal();
  };
  const change = (step: number) => {
    if (!active || busy.has(active)) return;
    const next = visible[(visible.indexOf(active) + step + visible.length) % visible.length];
    if (next) {
      active = next;
      renderPreview();
    }
  };
  const onClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target;
    const filter = target.closest<HTMLButtonElement>('[data-card-filter]');
    if (filter) {
      root.querySelectorAll('[data-card-filter]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button === filter));
      });
      for (const figure of figures)
        figure.hidden = !filter.hasAttribute('data-card-all') && figure.dataset.category !== filter.dataset.cardFilter;
      visible = figures.filter((figure) => !figure.hidden);
      const resultCount = root.querySelector('[data-card-count]');
      if (resultCount) resultCount.textContent = `${visible.length} 张卡面`;
      status.textContent = '';
    }
    const figure = target.closest<HTMLElement>('[data-card-item]');
    if (figure && target.closest('[data-card-zoom]')) openPreview(figure);
    else if (figure && target.closest('[data-card-toggle]')) {
      if (figure.dataset.backPreview) void flip(figure);
      else openPreview(figure);
    }
    if (target.closest('[data-card-lightbox-toggle]') && active) void flip(active);
    if (target.closest('[data-card-close]') || target === dialog) dialog.close();
    if (target.closest('[data-card-previous]')) change(-1);
    if (target.closest('[data-card-next]')) change(1);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      change(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };
  const onClose = () => {
    // The dialog reuses one image surface; a closed card must not flash over the next preview.
    for (const animation of previewFlash.getAnimations()) animation.cancel();
  };
  const cleanup = () => {
    disposed = true;
    for (const animation of animations) animation.cancel();
    animations.clear();
    dialog.close();
    root.removeEventListener('click', onClick);
    dialog.removeEventListener('keydown', onKeyDown);
    dialog.removeEventListener('close', onClose);
    delete root.dataset.ready;
  };
  root.addEventListener('click', onClick);
  dialog.addEventListener('keydown', onKeyDown);
  dialog.addEventListener('close', onClose);
  document.addEventListener('astro:before-swap', cleanup, { once: true });
}
