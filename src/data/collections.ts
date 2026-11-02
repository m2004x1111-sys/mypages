export const collectionSections = [
  {
    number: '01',
    title: '旅行记录',
    english: 'On the road',
    description: '把走过的路，写成值得回看的故事。',
    href: '/travel',
    image: '/img/travel/coast.webp',
    icon: 'ri:compass-3-line',
  },
  {
    number: '02',
    title: '图片收藏',
    english: 'Little moments',
    description: '收集让人停下脚步的光影与画面。',
    href: '/gallery',
    image: '/img/cover/21.webp',
    icon: 'ri:image-line',
  },
  {
    number: '03',
    title: '喜欢的作品',
    english: 'Stories I keep',
    description: '为喜欢的故事，留一个长久的位置。',
    href: '/favorites',
    image: '/img/cover/16.webp',
    icon: 'ri:bookmark-3-line',
  },
] as const;

export const galleryImages = [
  {
    title: '沿着海岸，慢慢走',
    category: '风景',
    image: '/img/travel/coast.webp',
    note: '风景示例 · 摄影 Ian Schneider / Unsplash',
    source: 'https://unsplash.com/photos/WymR2nYtj5M',
  },
  {
    title: '春日来信',
    category: '插画',
    image: '/img/cover/21.webp',
    note: '插画示例 · 来自原主题示例素材',
    source: 'https://github.com/cosZone/astro-koharu',
  },
  {
    title: '山与湖之间',
    category: '风景',
    image: '/img/travel/lake.webp',
    note: '风景示例 · 摄影 Philip Ho / Unsplash',
    source: 'https://unsplash.com/photos/2HFe1VFPlyQ',
  },
  {
    title: '电车与晚霞',
    category: '插画',
    image: '/img/cover/16.webp',
    note: '插画示例 · 来自原主题示例素材',
    source: 'https://github.com/cosZone/astro-koharu',
  },
  {
    title: '粉色的季节',
    category: '插画',
    image: '/img/cover/4.webp',
    note: '插画示例 · 来自原主题示例素材',
    source: 'https://github.com/cosZone/astro-koharu',
  },
  {
    title: '把好心情收藏起来',
    category: '插画',
    image: '/img/cover/11.webp',
    note: '插画示例 · 来自原主题示例素材',
    source: 'https://github.com/cosZone/astro-koharu',
  },
] as const;

export const favoriteExamples = [
  {
    category: '动画',
    title: '一部想反复看的动画',
    subtitle: 'FOR THE WORLDS WE LOVE',
    icon: 'ri:sparkling-line',
    image: '/img/cover/16.webp',
    note: '有的角色、有的片段，会陪着人走很长一段路。',
    color: '#f1b6c9',
  },
  {
    category: '电影',
    title: '一部留有余韵的电影',
    subtitle: 'AFTER THE LAST FRAME',
    icon: 'ri:film-line',
    image: '/img/travel/coast.webp',
    note: '电影结束以后，故事还在心里慢慢生长。',
    color: '#9bc8d7',
  },
  {
    category: '书籍',
    title: '一本舍不得合上的书',
    subtitle: 'BETWEEN THE PAGES',
    icon: 'ri:book-open-line',
    image: '/img/travel/lake.webp',
    note: '把某一页折进记忆，也把某句话留给自己。',
    color: '#b8c8aa',
  },
] as const;
