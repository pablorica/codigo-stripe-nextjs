
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: any; // we can refine later if needed
}


export default async function PostsPage() {
  const res = await fetch(`${API_URL}/api/posts`, { cache: 'no-store' });
  const json = await res.json();
  const posts: Post[] = json.data;

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <div style={{ padding: 20 }}>
          <h1>My Blog</h1>
          {posts.map((post) => (
            <div key={post.id}>
              
              <Link href={`posts/${post.slug}`}>
              <h2>{post.title}</h2>
              </Link>



              <BlocksRenderer content={post.excerpt} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
