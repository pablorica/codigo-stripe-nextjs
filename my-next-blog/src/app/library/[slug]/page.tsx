// src/app/posts/[slug]/page.tsx
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { getPost, API_URL } from './data';

// re-export so this route still provides generateMetadata
export { generatePostMetadata as generateMetadata } from './seo';

// params is a Promise — await it before using
export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>;
}) {
    
  const { slug } = await params;

  const post = await getPost(slug);
  if (!post) notFound();

  const { title, excerpt, content } = post;

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', lineHeight: 1.6 }}>
      <h1>{title}</h1>
      {excerpt ? <BlocksRenderer content={excerpt} /> : null}
      <article>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img({ node, ...props }) {

              const raw = `${props.src ?? ''}`; // force string (it can be Blob)
              if (!raw) return null;

              const src = raw.startsWith('http') ? raw : `${API_URL}${raw}`;
    
              // Simple, safe default: fixed intrinsic size + responsive display
              return (
                <Image
                  src={src}
                  alt={props.alt ?? ''}
                  width={1200}            // pick a sane default
                  height={800}            // keep aspect ratio consistent
                  sizes="(max-width: 720px) 100vw, 720px"
                  style={{ width: '100%', height: 'auto' }}
                />
              );
            },
          }}
        >
          {content || ''}
        </ReactMarkdown>
      </article>
    </main>
  );
}
