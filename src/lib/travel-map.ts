import type { TravelLocation } from '@/types/travel-map';

export function getTravelView(search: string): 'list' | 'map' {
  return new URLSearchParams(search).get('view') === 'map' ? 'map' : 'list';
}

export function hasValidCoordinates(coordinates: readonly [number, number]): boolean {
  const [latitude, longitude] = coordinates;
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

export function filterTravelLocations(locations: readonly TravelLocation[], country = '', query = ''): TravelLocation[] {
  const term = query.trim().toLocaleLowerCase();
  return locations.filter((location) => {
    if (!hasValidCoordinates(location.coordinates) || !location.photos.length) return false;
    if (country && location.country !== country) return false;
    if (!term) return true;
    return [location.title, location.country, location.region, ...location.photos.map((photo) => photo.title)]
      .join(' ')
      .toLocaleLowerCase()
      .includes(term);
  });
}
