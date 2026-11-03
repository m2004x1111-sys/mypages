import { travelPhotos } from './travel-photos';

export const collectionSections = [
  {
    number: '01',
    title: '旅游日志',
    english: 'Travel stories',
    description: '记录一下',
    href: '/travel',
    image: travelPhotos[0].image,
    icon: 'ri:compass-3-line',
  },
  {
    number: '02',
    title: '好图收藏',
    english: 'イラスト',
    description: '觉得好看的图',
    href: '/gallery',
    image: '/img/yuri/anda.png',
    icon: 'ri:image-line',
  },
  {
    number: '03',
    title: '好吃的百合',
    english: 'yuri stories',
    description: '觉得好看的百合',
    href: '/favorites',
    image: '/img/yuri/yuri1.webp',
    icon: 'ri:bookmark-3-line',
  },
] as const;

export interface GalleryImage {
  title: string;
  category: string;
  image: string;
  note?: string;
  source?: string;
  sourceLabel?: string;
  example?: boolean;
}

export const travelGalleryImages: readonly GalleryImage[] = travelPhotos.map((photo) => ({
  ...photo,
  category: '旅行',
  source: photo.image,
  sourceLabel: '查看原图 ↗',
}));

export const galleryImages: readonly GalleryImage[] = [
  ...travelGalleryImages,
  {
    title: '上伊那',
    category: '上伊那',
    image: '/img/y1/y1.webp',
    note: '牡丹X伊吹',
    source: '--- IGNORE ---',
    example: false,
  },
  {
    title: '周次',
    category: '周次',
    image: '/img/y1/y2.webp',
    note: '仙台X宫城',
    source: '--- IGNORE ---',
    example: false,
  },
  {
    title: '梦限大',
    category: '梦限大',
    image: '/img/y1/y3.webp',
    note: '藤都子X薇欧拉',
    source: '--- IGNORE ---',
    example: false,
  },
  {
    title: '宵崎奏',
    category: '世界计划',
    image: '/img/y1/y4.webp',
    note: '宵崎奏',
    source: '--- IGNORE ---',
    example: false,
  },
] as const;

export interface FavoriteWork {
  category: string;
  title: string;
  subtitle: string;
  icon: string;
  image: string;
  note: string;
  color: string;
  url?: string;
}

// 在每部作品的 url 中填写书籍网址；留空时显示「阅读链接待补充」。
export const favoriteExamples: readonly FavoriteWork[] = [
  {
    category: '小说',
    title: '我的工作和同居的她',
    subtitle: 'JK  X  OL',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri1.webp',
    note: '这是我第一本看得年龄差',
    color: '#f1b6c9',
    url: 'https://kakuyomu.jp/works/1177354055324489792',
  },
  {
    category: '小说',
    title: '不纯初恋',
    subtitle: 'jk x  jk  x  jk ',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri2.webp',
    note: '很喜欢的一本扭曲文',
    color: '#9bc8d7',
    url: ' 1',
  },
  {
    category: '小说',
    title: '迷生教',
    subtitle: 'jk X ol',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri3.webp',
    note: '入间老师的师生恋',
    color: '#b8c8aa',
    url: 'https://kakuyomu.jp/works/16818093073465768496',
  },
  {
    category: '小说',
    title: '周次',
    subtitle: 'jk x  jk',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri4.webp',
    note: '不得不评鉴的宫城与仙台',
    color: '#b8c8aa',
    url: 'https://kakuyomu.jp/works/1177354054894027232',
  },
  {
    category: '小说',
    title: '存在证明',
    subtitle: 'jk x  jk  x  jk ',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri5.webp',
    note: '封面好看',
    color: '#9bc8d7',
    url: ' ',
  },
  {
    category: '漫画',
    title: '请问今天要来点兔子吗？',
    subtitle: '智乃 x  心爱',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri6.webp',
    note: '智乃和心爱',
    color: '#f1b6c9',
    url: 'https://www.bilibili.com/bangumi/play/ss34415?spm_id_from=333.337.0.0',
  },
  {
    category: '小说',
    title: '败给了性格恶劣的天才青梅',
    subtitle: 'jk x  jk',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri7.webp',
    note: '青梅竹马',
    color: '#9bc8d7',
    url: 'https://kakuyomu.jp/works/16817139557519509664',
  },
  {
    category: '小说',
    title: '与睡美人入眠',
    subtitle: 'jk x ol ',
    icon: 'ri:book-open-line',
    image: '/img/yuri/yuri9.webp',
    note: '红茶老师是神！',
    color: '#f1b6c9',
    url: 'https://kakuyomu.jp/works/16818093089913215356',
  },
] as const;
