import { useTranslation } from '@hooks/useTranslation';
import { translateCategoryName } from '@lib/content/category-translate';
import { encodeSlug } from '@lib/url';
import { localizedPath } from '@/i18n';
import type { PostRefWithCategory } from '@/types/blog';

interface Props {
  posts: PostRefWithCategory[];
  locale?: string;
}

export default function RelatedPostList({ posts, locale }: Props) {
  const { t } = useTranslation(locale);
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-2xl text-foreground/80">{t('post.relatedPosts')}</h2>
      <div className="flex flex-col gap-2">
        {posts.map((post, index) => (
          <a
            key={post.slug}
            href={localizedPath(`/post/${encodeSlug(post.link ?? post.slug)}`, locale)}
            className="motion-reveal group flex gap-3 rounded-md p-2 text-sm transition-colors duration-300 [--rise-y:0.75rem] hover:bg-foreground/5 hover:text-primary"
          >
            <span className="shrink-0 font-mono text-foreground/30">{index + 1}</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              {post.categoryName && (
                <div className="truncate text-foreground/50 text-xs">
                  {locale ? translateCategoryName(post.categoryName, locale) : post.categoryName}
                </div>
              )}
              <div className="line-clamp-2 text-foreground/80 transition-colors group-hover:text-primary">{post.title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
