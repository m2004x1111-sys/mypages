import { getImage } from 'astro:assets';
import { resolveResponsiveImage } from './responsive-image';

/** Prepare browser images while retaining the source URL for an original-image link. Server only. */
export async function getPhotoAssets(src: string) {
  const image = await resolveResponsiveImage(src);
  if (!image) return { thumbnail: src, preview: src, width: 1000, height: 700 };
  const [thumbnail, preview] = await Promise.all([
    getImage({ src: image.src, width: Math.min(960, image.src.width), format: 'webp', quality: 76 }),
    getImage({ src: image.src, width: Math.min(1800, image.src.width), format: 'webp', quality: 82 }),
  ]);
  return {
    thumbnail: thumbnail.src,
    preview: preview.src,
    width: Number(thumbnail.attributes.width),
    height: Number(thumbnail.attributes.height),
  };
}
