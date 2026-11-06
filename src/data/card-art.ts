import type { GalleryImage } from './collections';

export interface CardArtImage extends GalleryImage {
  /** 第二张卡面；不填写时作为单张图片展示。 */
  secondImage?: string;
}

// 当前卡面图片在 public/img/card/；新增图片也可以放在 public/img/cards/。
// 数组顺序就是页面展示顺序；.1 是第一张，.2 是点击后切换的第二张。
// 复制下面的示例到数组里，并去掉每行开头的 //，即可添加一张卡面。
// {
//   title: '卡面名称',
//   category: '游戏或作品名称',
//   image: '/img/cards/first-card.webp',
//   secondImage: '/img/cards/second-card.webp',
//   note: '喜欢这张卡面的理由。',
// },
// title、category、image 必填；secondImage 可选，填写后点击图片会闪白切换。
// note 为可选说明，在放大预览时显示。
export const cardArtImages: readonly CardArtImage[] = [
  {
    title: '奏1',
    category: '奏宝',
    image: '/img/card/1.1.png',
    secondImage: '/img/card/1.2.png',
  },
  {
    title: '奏2',
    category: '奏宝',
    image: '/img/card/2.1.png',
    secondImage: '/img/card/2.2.png',
  },
  {
    title: '奏3   ',
    category: '奏宝',
    image: '/img/card/3.png',
  },
  {
    title: '奏4',
    category: '奏宝',
    image: '/img/card/4.1.png',
    secondImage: '/img/card/4.2.png',
  },
  {
    title: '奏5',
    category: '奏宝',
    image: '/img/card/5.1.png',
    secondImage: '/img/card/5.2.png',
  },
  {
    title: '奏6',
    category: '奏宝',
    image: '/img/card/6.1.png',
    secondImage: '/img/card/6.2.png',
  },
  {
    title: '奏7',
    category: '奏宝',
    image: '/img/card/7.1.png',
    secondImage: '/img/card/7.2.png',
  },
  {
    title: '奏8',
    category: '奏宝',
    image: '/img/card/8.1.png',
    secondImage: '/img/card/8.2.png',
  },
  {
    title: '奏9',
    category: '奏宝',
    image: '/img/card/9.1.png',
    secondImage: '/img/card/9.2.png',
  },
  {
    title: '奏10',
    category: '奏宝',
    image: '/img/card/10.1.png',
    secondImage: '/img/card/10.2.png',
  },
];
