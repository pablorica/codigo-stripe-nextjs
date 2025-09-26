// src/app/posts/[slug]/seo.ts
import type { Metadata } from 'next';
import { getPost, API_URL } from './data';

// ---- helpers ----
function blocksToText(blocks: any): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((b: any) =>
      Array.isArray(b?.children)
        ? b.children.map((c: any) => c?.text ?? '').join('')
        : ''
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripMarkdown(md: string): string {
  return (md || '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')        // images
    .replace(/\[[^\]]*]\(([^)]*)\)/g, '$1')     // links -> text
    .replace(/[*_`>#~-]/g, '')                  // md symbols
    .replace(/\n+/g, ' ')
    .trim();
}

function firstMarkdownImage(md: string): string | null {
  const m = (md || '').match(/!\[[^\]]*]\(([^)]+)\)/);
  if (!m) return null;
  const url = m[1];
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}

// ---- exported metadata generator (async params!) ----
export async function generatePostMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Post not found', robots: { index: false, follow: false } };
  }

  const title = post.title ?? 'Article';
  const descFromBlocks = blocksToText(post.excerpt);
  const descFromMd = stripMarkdown(post.content ?? '');
  const description = (descFromBlocks || descFromMd).slice(0, 160);

  const ogImage = firstMarkdownImage(post.content ?? '') || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/library/${slug}` },
    openGraph: {
      type: 'article',
      url: `/library/${slug}`,
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
