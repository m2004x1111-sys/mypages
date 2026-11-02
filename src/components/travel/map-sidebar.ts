import type { TravelLocation } from '@/types/travel-map';

export function renderPlaces(container: HTMLElement, locations: readonly TravelLocation[], selectedId?: string) {
  const items = locations.map((location) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'map-place-button';
    button.dataset.location = location.id;
    button.setAttribute('aria-pressed', String(location.id === selectedId));
    const image = document.createElement('img');
    image.src = location.photos[0].image;
    image.alt = '';
    image.loading = 'lazy';
    const text = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = location.title;
    const meta = document.createElement('small');
    meta.textContent = `${location.country} · ${location.photos.length} 张图片`;
    text.append(title, meta);
    const arrow = document.createElement('span');
    arrow.className = 'map-place-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    button.append(image, text, arrow);
    return button;
  });
  container.replaceChildren(...items);
}

export function renderLocationDetail(container: HTMLElement, location?: TravelLocation) {
  container.replaceChildren();
  container.hidden = !location;
  if (!location) return;
  const category = document.createElement('p');
  category.className = 'map-detail-region';
  category.textContent = `${location.region}${location.example ? ' / 示例' : ''}`;
  const heading = document.createElement('h3');
  heading.textContent = location.title;
  const description = document.createElement('p');
  description.className = 'map-detail-description';
  description.textContent = location.description;
  const photos = document.createElement('div');
  photos.className = 'map-detail-photos';
  location.photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.mapPhoto = String(index);
    button.setAttribute('aria-label', `放大旅行照片：${photo.title}`);
    const image = document.createElement('img');
    image.src = photo.image;
    image.alt = photo.title;
    image.loading = 'lazy';
    const caption = document.createElement('span');
    caption.textContent = photo.title;
    button.append(image, caption);
    photos.append(button);
  });
  container.append(category, heading, description, photos);
  if (location.articleHref) {
    const article = document.createElement('a');
    article.className = 'map-article-link';
    article.href = location.articleHref;
    article.textContent = '读这段旅程 →';
    container.append(article);
  }
}
