// src/app/posts/[slug]/data.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL!; // e.g. http://localhost:1337

export async function getPost(slug: string) {
  const res = await fetch(
    `${API_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.[0] ?? null; // v5: flat item
}

export { API_URL };
