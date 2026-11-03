import type { TravelPhoto } from '@/types/travel-map';

// 这批照片按「东京旅行」归档；文件名中的日期是导入标识，不代表拍摄日期。
// 修改标题、说明时保留 image 路径，即可继续查看未改动的原图。
export const travelPhotos = [
  { title: '高尾山1', image: '/img/travel/微信图片_20261102182515_95_51.jpg', note: '做缆车' },
  { title: '高尾山2', image: '/img/travel/微信图片_20261102182517_96_51.jpg', note: '向高尾山进发' },
  { title: '高尾山3', image: '/img/travel/微信图片_20261102182519_97_51.jpg', note: '高尾山站' },
  { title: '成田机场', image: '/img/travel/微信图片_20261102182520_98_51.jpg', note: '最喜欢的787-9' },
  { title: '大室山', image: '/img/travel/微信图片_20261102182522_99_51.jpg', note: '去大室山时电车上拍到的' },
  { title: '大室山', image: '/img/travel/微信图片_20261102182523_100_51.jpg', note: '大室山顶，对面是富士山' },
  { title: '大室山', image: '/img/travel/微信图片_20261102182524_101_51.jpg', note: '大室山全景' },
  { title: '立川', image: '/img/travel/微信图片_20261102182526_102_51.jpg', note: '辉夜姬巡礼' },
  { title: '立川', image: '/img/travel/微信图片_20261102182528_103_51.jpg', note: '辉夜姬巡礼' },
  { title: '大室山', image: '/img/travel/微信图片_20261102182529_104_51.jpg', note: '大室山' },
] as const satisfies readonly TravelPhoto[];
