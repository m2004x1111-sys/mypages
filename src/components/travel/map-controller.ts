import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { filterTravelLocations } from '@lib/travel-map';
import type { TravelLocation } from '@/types/travel-map';
import { renderLocationDetail, renderPlaces } from './map-sidebar';
import { createPhotoDialog } from './photo-dialog';

interface MapData {
  locations: TravelLocation[];
  tiles: { url: string; attribution: string };
}

export function createTravelMap(root: HTMLElement) {
  const canvas = root.querySelector<HTMLElement>('[data-map-canvas]');
  const dataElement = root.querySelector('[data-travel-map-data]');
  const places = root.querySelector<HTMLElement>('[data-map-places]');
  const detail = root.querySelector<HTMLElement>('[data-map-detail]');
  const country = root.querySelector<HTMLSelectElement>('[data-map-country]');
  const search = root.querySelector<HTMLInputElement>('[data-map-search]');
  const count = root.querySelector('[data-map-count]');
  const empty = root.querySelector<HTMLElement>('[data-map-empty]');
  const status = root.querySelector('[data-map-status]');
  const loading = root.querySelector<HTMLElement>('[data-map-loading]');
  if (!canvas || !dataElement || !places || !detail || !country || !search || !count || !empty || !status)
    throw new Error('Missing map surface');
  const data = JSON.parse(dataElement.textContent ?? '{}') as MapData;
  const initialUrl = new URL(window.location.href);
  if ([...country.options].some((option) => option.value === initialUrl.searchParams.get('country')))
    country.value = initialUrl.searchParams.get('country') ?? '';
  search.value = initialUrl.searchParams.get('q') ?? '';
  const map = L.map(canvas, {
    scrollWheelZoom: false,
    minZoom: 2,
    maxZoom: 18,
    zoomControl: false,
    maxBounds: [
      [-85, -180],
      [85, 180],
    ],
    maxBoundsViscosity: 0.8,
  }).setView([30, 105], 3);
  L.control.zoom({ position: 'topleft', zoomInTitle: '放大地图', zoomOutTitle: '缩小地图' }).addTo(map);
  const layers = L.layerGroup().addTo(map);
  const markers = new Map<string, L.Marker>();
  const viewer = createPhotoDialog(root);
  let visible = filterTravelLocations(data.locations);
  let selected: TravelLocation | undefined;
  let tilesLoaded = false;
  let destroyed = false;
  const tiles = L.tileLayer(data.tiles.url, { maxZoom: 19, attribution: data.tiles.attribution, noWrap: true });
  tiles.on('tileload', () => {
    tilesLoaded = true;
    if (loading) loading.hidden = true;
    status.textContent = '拖动地图浏览 · 使用 + / − 缩放 · 点击标记查看照片';
  });
  tiles.on('tileerror', () => {
    if (loading) loading.hidden = true;
    if (!tilesLoaded) status.textContent = '底图暂时无法加载，仍可通过地点清单查看照片。';
  });

  const fit = () => {
    map.invalidateSize();
    if (!visible.length) return;
    const bounds = L.latLngBounds(visible.map((location) => L.latLng(location.coordinates[0], location.coordinates[1])));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: visible.length === 1 ? 7 : 8, animate: false });
  };
  const select = (location: TravelLocation, move = false) => {
    selected = location;
    places.querySelectorAll<HTMLButtonElement>('[data-location]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.location === location.id));
    });
    renderLocationDetail(detail, location);
    for (const [id, marker] of markers) marker.getElement()?.classList.toggle('is-selected', id === location.id);
    const url = new URL(window.location.href);
    url.searchParams.set('place', location.id);
    window.history.replaceState(window.history.state, '', url);
    if (move) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map.setView([location.coordinates[0], location.coordinates[1]], Math.max(map.getZoom(), 7), { animate: !reducedMotion });
    }
  };
  const refreshLocations = () => {
    visible = filterTravelLocations(data.locations, country.value, search.value);
    layers.clearLayers();
    markers.clear();
    const totalPhotos = visible.reduce((total, location) => total + location.photos.length, 0);
    count.textContent = `${visible.length} 个地点 · ${totalPhotos} 张`;
    empty.hidden = visible.length > 0;
    for (const location of visible) {
      const disc = document.createElement('span');
      disc.className = 'travel-pin-disc';
      const image = document.createElement('img');
      image.src = location.photos[0].image;
      image.alt = '';
      const badge = document.createElement('b');
      badge.textContent = String(location.photos.length);
      disc.append(image, badge);
      const icon = L.divIcon({ html: disc, className: 'travel-pin', iconSize: [48, 54], iconAnchor: [24, 54] });
      const marker = L.marker([location.coordinates[0], location.coordinates[1]], {
        icon,
        title: location.title,
        keyboard: true,
      }).addTo(layers);
      marker.getElement()?.setAttribute('aria-label', `查看地点：${location.title}`);
      const tooltip = document.createElement('span');
      tooltip.textContent = location.title;
      marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -47] });
      marker.on('click', () => select(location, true));
      markers.set(location.id, marker);
    }
    const requestedPlace = new URL(window.location.href).searchParams.get('place');
    const next = visible.find((location) => location.id === (selected?.id ?? requestedPlace)) ?? visible[0];
    renderPlaces(places, visible, next?.id);
    if (next) select(next);
    else {
      selected = undefined;
      renderPlaces(places, []);
      renderLocationDetail(detail);
    }
    const url = new URL(window.location.href);
    if (country.value) url.searchParams.set('country', country.value);
    else url.searchParams.delete('country');
    if (search.value.trim()) url.searchParams.set('q', search.value.trim());
    else url.searchParams.delete('q');
    if (!selected) url.searchParams.delete('place');
    window.history.replaceState(window.history.state, '', url);
    fit();
  };
  const click = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const place = target.closest<HTMLElement>('[data-location]');
    if (place) {
      const location = visible.find((item) => item.id === place.dataset.location);
      if (location) select(location, true);
    }
    const photo = target.closest<HTMLElement>('[data-map-photo]');
    if (photo && selected) viewer.open(selected, Number(photo.dataset.mapPhoto));
    if (target.closest('[data-map-overview]')) {
      country.value = '';
      search.value = '';
      refreshLocations();
    }
  };
  root.addEventListener('click', click);
  country.addEventListener('change', refreshLocations);
  search.addEventListener('input', refreshLocations);
  const resize = new ResizeObserver(() => {
    if (!destroyed) map.invalidateSize();
  });
  resize.observe(canvas);
  if (loading) loading.hidden = true;
  refreshLocations();
  tiles.addTo(map);
  return {
    refresh() {
      requestAnimationFrame(() => {
        if (!destroyed) map.invalidateSize();
      });
    },
    destroy() {
      destroyed = true;
      resize.disconnect();
      viewer.destroy();
      root.removeEventListener('click', click);
      country.removeEventListener('change', refreshLocations);
      search.removeEventListener('input', refreshLocations);
      map.remove();
    },
  };
}
