# benmingw の小窝

基于 Astro Koharu 的个人博客。主题采用 AGPL-3.0，许可证与原作者署名已保留。

当前网站围绕「旅行记录、图片收藏、喜欢的作品」制作，暂时使用标明为示例的内容。网站已公开访问，当前未绑定自有域名；可先完成网页，之后再绑定域名。

## 三个内容页面

- `/travel`：旅行手记。读取文章中的「旅行」分类，真实旅行文章也放在 `src/content/blog/`，分类设为 `categories: [旅行]` 即可。
- `/gallery`：相册，支持类型筛选、图片放大、左右切换和 Esc 关闭。清单在 `src/data/collections.ts` 的 `galleryImages` 中，每项包含标题、分类、图片路径、备注和来源。
- `/favorites`：作品收藏页。当前三张卡片为示例占位，数据在同一文件的 `favoriteExamples` 中，可以替换作品名、封面与喜欢的原因。布局在 `src/components/collections/FavoriteShelf.astro`。

首页的三个入口也在 `src/data/collections.ts` 中配置。首页布局为 `src/pages/index.astro`，独立页面布局为 `src/components/collections/CollectionPage.astro`。

## 旅行的两种浏览方式

旅行页保留「默认列表」，另有「地图浏览」。地图支持拖动、缩放、地区筛选、地点或照片搜索、点标记查看相册，以及放大照片。默认列表不加载地图脚本或底图。

地图地址可分享，例如 `/travel?view=map`；选定地区、关键词或地点后，地址也会保存相应状态。切回默认列表仍保留原有文章阅读方式。

地图数据在 `src/data/travel-locations.ts`。当前两处均为演示地区，不是 benmingw 的真实旅行足迹，坐标也不表示摄影素材的准确拍摄点。

添加自己的地点：将照片放入 `public/img/travel/`，再在 `travelLocations` 数组中加入类似下面的对象。坐标为 WGS84，顺序是「纬度、经度」，同一地点可以添加多张照片。

```typescript
{
  id: 'my-first-trip',
  title: '我的第一段旅程',
  country: '日本',
  region: '东京',
  coordinates: [35.69, 139.7], // 仅为填写格式示例
  description: '在这里写这段旅行的感受。',
  articleHref: '/post/my-first-post', // 可选，需指向已发布文章
  photos: [
    { title: '街角的一张照片', image: '/img/travel/my-photo.webp', note: '照片说明' },
  ],
}
```

真实记录不必设置 `example: true`。删除所有示例地点后，数组也可以留空；页面会显示空状态。地区选项来自地点的 `country` 字段，搜索还会匹配 `region`、地点名与照片标题。

底图使用 Leaflet 与 OpenStreetMap，保留地图署名，按当前视野请求瓦片，不提供离线批量下载。网络无法加载底图时，仍可通过地点清单查看照片；也可以切回默认列表。底图服务配置在同一数据文件的 `travelMapTiles` 中。

地图筛选和数据验证测试命令：`pnpm test:travel`。

风景示例照片下载自 Unsplash，并在页面保留来源链接；动漫插画为原主题示例素材。自己的照片可以放在 `public/img/` 并替换对应路径。当前示例旅行和作品占位均不代表本人实际经历或真实收藏。

## 本机预览

在当前项目目录打开终端，运行：

```powershell
pnpm dev --host 127.0.0.1
```

打开 http://localhost:4321 。关闭终端后，再次运行同一命令即可启动。

## 修改个人信息

编辑 `config/site.yaml`，修改 `site.title`、`site.subtitle`、`site.description` 等字段。修改后重启预览。

- 头像：当前为临时字母头像 `public/img/benmingw-avatar.svg`。把自己的头像放进 `public/img/`，再修改 `site.avatar`。
- 首页封面：替换 `public/img/site_header_800.webp`、`site_header_1200.webp`、`site_header_1600.webp` 和 `site_header_1920.webp`。目前使用主题自带的示例素材。
- 社交账号：在 `social` 中添加真实链接，不会自动假定昵称就是 GitHub 账号。
- 文章分类与导航：在 `categoryMap`、`featuredCategories` 和 `navigation` 中配置。

## 写文章

所有文章在 `src/content/blog/`。当前五篇均为示例，已标注「示例文章」；两篇归于「旅行」，两篇归于「收藏」，一篇介绍小窝。原主题教学文章保存在 `docs/theme-examples/blog/`，不会发布到博客中。

创建一个 Markdown 文件，例如 `src/content/blog/life/my-first-post.md`：

```markdown
---
title: 我的第一篇文章
link: my-first-post
date: 2026-11-02 12:00:00
description: 这里写文章摘要。
cover: /img/cover/2.webp
categories: [随笔]
tags: [生活]
catalog: true
---

## 今天想说的话

在这里写正文。
```

`link` 是永久文章地址，需保持唯一；上述文章地址为 `/post/my-first-post`。真实文章不必加 `colophon: [example]`。添加 `draft: true` 可以保存为草稿，草稿不会出现在正式构建中。

浏览器 `/editor` 为写作室，草稿保存在当前浏览器；需下载 Markdown 再放到文章目录，重新构建发布。若要通过界面直接管理本机文件，运行 `pnpm cms`，打开终端给出的本机地址。写作室不会直接改动线上网站。

## 构建与发布

```powershell
pnpm lint:fix
pnpm check
pnpm build
pnpm preview --host 127.0.0.1
```

发布内容为 `dist/`，可使用当前已配置的 Sites，也可后续部署到 Vercel 或其他静态托管平台。更换线上域名时，修改 `config/site.yaml` 的 `site.url` 后重新构建，以更新 RSS、站点地图和分享地址。

首次 Sites 发布默认为仅本人可访问；需要对外开放时，再修改站点访问范围。

## 素材与源码

默认二次元插画来自原主题示例素材。正式使用时可以换成自己的图片。

原主题：https://github.com/cosZone/astro-koharu

设计参考：https://yuki-bloom.vercel.app/

本站源码下载由 `pnpm build` 自动生成，位置为 `dist/source.tar.gz`，不包含依赖、构建缓存、本机配置与环境变量。

如果从下载的源码包开始使用，在解压后的项目根目录先运行 `git init`，再运行 `pnpm install` 和 `pnpm build`。本项目用 Git 文件清单生成源码下载包；从站点仓库克隆的项目无需重复初始化。
