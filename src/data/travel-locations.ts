import type { TravelLocation } from '@/types/travel-map';

// These locations demonstrate the interface, not the owner's travel history.
// Coordinates indicate an example region, not an exact photographic position.
export const travelLocations: readonly TravelLocation[] = [
  {
    id: 'coastal-example',
    title: '海岸线的风',
    country: '美国',
    region: '加利福尼亚 · 海岸地区',
    coordinates: [36.27, -121.81],
    description: '先给未来的海边旅行留一个位置。此处为示例地区，照片与点位均不代表本人的旅行记录。',
    example: true,
    articleHref: '/post/ordinary-days',
    photos: [
      {
        title: '沿着海岸，慢慢走',
        image: '/img/travel/coast.webp',
        note: '示例摄影：Ian Schneider / Unsplash；点位仅用于地区浏览演示。',
        source: 'https://unsplash.com/photos/WymR2nYtj5M',
      },
    ],
  },
  {
    id: 'mountain-example',
    title: '山与湖之间',
    country: '加拿大',
    region: '艾伯塔 · 山湖地区',
    coordinates: [51.42, -116.22],
    description: '把山野的安静收进一张照片。此处为示例地区，尚未加入本人的真实地点与实拍图片。',
    example: true,
    articleHref: '/post/learning-notes',
    photos: [
      {
        title: '山与湖之间',
        image: '/img/travel/lake.webp',
        note: '示例摄影：Philip Ho / Unsplash；点位仅用于地区浏览演示。',
        source: 'https://unsplash.com/photos/2HFe1VFPlyQ',
      },
    ],
  },
];

// Only tiles visible in the visitor's current viewport are requested.
export const travelMapTiles = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
};
