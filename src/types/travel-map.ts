export interface TravelPhoto {
  title: string;
  image: string;
  note?: string;
  source?: string;
}

export interface TravelLocation {
  id: string;
  title: string;
  country: string;
  region: string;
  /** Latitude, longitude in WGS84. */
  coordinates: readonly [number, number];
  description: string;
  photos: readonly TravelPhoto[];
  articleHref?: string;
  example?: boolean;
}
