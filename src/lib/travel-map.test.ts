import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TravelLocation } from '../types/travel-map';
import { filterTravelLocations, getTravelView, hasValidCoordinates } from './travel-map';

const locations: TravelLocation[] = [
  {
    id: 'coast',
    title: '海边散步',
    country: '示例国甲',
    region: 'West Coast',
    coordinates: [35, 120],
    description: '',
    photos: [{ title: '傍晚的海浪', image: '/coast.webp' }],
  },
  {
    id: 'lake',
    title: '山间的湖',
    country: '示例国乙',
    region: '山野',
    coordinates: [45, -110],
    description: '',
    photos: [{ title: '水面的倒影', image: '/lake.webp' }],
  },
];

test('the existing list stays the default; an explicit map URL opens the map', () => {
  assert.equal(getTravelView(''), 'list');
  assert.equal(getTravelView('?view=unknown'), 'list');
  assert.equal(getTravelView('?view=map&country=x'), 'map');
});

test('region and photo searches combine with the selected country without mutating the data', () => {
  assert.deepEqual(
    filterTravelLocations(locations, '示例国甲', ' west COAST ').map((item) => item.id),
    ['coast'],
  );
  assert.deepEqual(
    filterTravelLocations(locations, '', '倒影').map((item) => item.id),
    ['lake'],
  );
  assert.deepEqual(filterTravelLocations(locations, '示例国乙', '海浪'), []);
  assert.deepEqual(
    locations.map((item) => item.id),
    ['coast', 'lake'],
  );
});

test('invalid coordinates and albums without photos never create map markers', () => {
  const invalid = [
    { ...locations[0], id: 'invalid-latitude', coordinates: [91, 0] as const },
    { ...locations[0], id: 'invalid-longitude', coordinates: [0, 181] as const },
    { ...locations[0], id: 'not-finite', coordinates: [Number.NaN, 0] as const },
    { ...locations[0], id: 'no-photos', photos: [] },
  ];
  assert.deepEqual(filterTravelLocations(invalid), []);
  assert.equal(hasValidCoordinates([0, 0]), true);
  assert.equal(hasValidCoordinates([-90, 180]), true);
});

test('empty datasets and unmatched searches produce a usable empty result', () => {
  assert.deepEqual(filterTravelLocations([]), []);
  assert.deepEqual(filterTravelLocations(locations, '', '不存在的地点'), []);
  assert.equal(filterTravelLocations(locations).length, 2);
});
