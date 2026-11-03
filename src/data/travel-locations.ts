import type { TravelLocation } from '@/types/travel-map';
import { travelPhotos } from './travel-photos';

// 按用户提供的「东京」归档。原图没有 GPS，坐标仅为城市级参考点。
export const travelLocations: readonly TravelLocation[] = [
  {
    id: 'tokyo',
    title: '东京旅行',
    country: '日本',
    region: '东京 · 区域参考点',
    coordinates: [35.68, 139.76],
    description: '旅游日志：东京',
    articleHref: '/post/ordinary-days',
    photos: travelPhotos,
  },
];

// Only tiles visible in the visitor's current viewport are requested.
export const travelMapTiles = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
};
