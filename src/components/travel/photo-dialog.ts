import type { TravelLocation } from '@/types/travel-map';

export function createPhotoDialog(root: HTMLElement) {
  const dialog = root.querySelector<HTMLDialogElement>('[data-map-dialog]');
  const image = root.querySelector<HTMLImageElement>('[data-photo-image]');
  const title = root.querySelector('#map-photo-title');
  const note = root.querySelector('[data-photo-note]');
  const count = root.querySelector('[data-photo-counter]');
  const source = root.querySelector<HTMLAnchorElement>('[data-photo-source]');
  const previous = root.querySelector<HTMLButtonElement>('[data-photo-previous]');
  const next = root.querySelector<HTMLButtonElement>('[data-photo-next]');
  if (!dialog || !image || !title || !note || !count || !source || !previous || !next) throw new Error('Missing photo viewer');
  let location: TravelLocation | undefined;
  let index = 0;
  const render = () => {
    const photo = location?.photos[index];
    if (!photo || !location) return;
    image.src = photo.image;
    image.alt = photo.title;
    title.textContent = location.title === photo.title ? photo.title : `${location.title} · ${photo.title}`;
    note.textContent = photo.note ?? '';
    count.textContent = `${index + 1} / ${location.photos.length}`;
    source.hidden = !photo.source;
    if (photo.source) source.href = photo.source;
    source.textContent = photo.sourceLabel ?? '素材来源 ↗';
    previous.disabled = next.disabled = location.photos.length < 2;
  };
  const change = (step: number) => {
    if (!location?.photos.length) return;
    index = (index + step + location.photos.length) % location.photos.length;
    render();
  };
  const click = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target === dialog || target.closest('[data-photo-close]')) dialog.close();
    if (target.closest('[data-photo-previous]')) change(-1);
    if (target.closest('[data-photo-next]')) change(1);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      change(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      change(1);
    }
  };
  dialog.addEventListener('click', click);
  dialog.addEventListener('keydown', keydown);
  return {
    open(selected: TravelLocation, photoIndex = 0) {
      location = selected;
      index = photoIndex;
      render();
      dialog.showModal();
    },
    destroy() {
      dialog.close();
      dialog.removeEventListener('click', click);
      dialog.removeEventListener('keydown', keydown);
    },
  };
}
