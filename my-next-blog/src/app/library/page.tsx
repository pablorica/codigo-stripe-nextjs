// src/app/library/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

const API_URL = process.env.NEXT_PUBLIC_API_URL!; // e.g. http://localhost:1337
const PAGE_SIZE = 10;

// Build a Strapi query string with nested filters
function buildQuery({
  q,
  theme,
  keywords,
  page,
  sort,
}: {
  q?: string;
  theme?: string;
  keywords?: string[];
  page?: number;
  sort?: string; // e.g. "published:desc"
}) {
  const p = new URLSearchParams();

  // Search (case-insensitive) across title + content
  if (q && q.trim()) {
    p.set('filters[$or][0][title][$containsi]', q.trim());
    p.set('filters[$or][1][content][$containsi]', q.trim());
  }

  // theme by slug
  if (theme) {
    p.set('filters[theme][slug][$eq]', theme);
  }

  // keywords (one or many) by slug
  (keywords ?? []).forEach((t, i) => {
    if (t) p.set(`filters[keywords][slug][$in][${i}]`, t);
  });

  // Sort & pagination
  p.set('sort', sort || 'published:desc');
  p.set('pagination[pageSize]', String(PAGE_SIZE));
  p.set('pagination[page]', String(page || 1));

  // Select only what we need for the list (v5 is flat, not attributes)
  p.set('fields[0]', 'title');
  p.set('fields[1]', 'slug');
  p.set('fields[2]', 'summary');
  p.set('fields[3]', 'published');
  p.set('populate[coverImage]', 'true'); // get image if present

  return p.toString();
}

async function fetchJSON(path: string) {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

type SearchParams = {
  q?: string;
  theme?: string;
  keywords?: string | string[]; // Next may pass string[] for repeated ?keywords=...
  sort?: string;
  page?: string;
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = sp.q || '';
  const theme = sp.theme || '';
  const keywordsArray = Array.isArray(sp.keywords)
    ? sp.keywords
    : (sp.keywords ? sp.keywords.split(',') : []);
  const sort = sp.sort || 'published:desc';
  const page = Number(sp.page || 1);

  // safer buildQuery
  const query = function buildQuery({
    q,
    theme,
    keywords,
    page,
    sort,
  }: {
    q?: string;
    theme?: string;
    keywords?: string[];
    page?: number;
    sort?: string;
  }) {
    const p = new URLSearchParams();
  
    if (q && q.trim()) {
      p.set('filters[$or][0][title][$containsi]', q.trim());
      p.set('filters[$or][1][content][$containsi]', q.trim());
    }
  
    if (theme) p.set('filters[theme][slug][$eq]', theme);
  
    (keywords ?? []).forEach((t) => {
      if (t) p.append('filters[keywords][slug][$in]', t); // no [0],[1] indices
    });
  
    p.set('sort', sort || 'published:desc');
    p.set('pagination[pageSize]', String(10));
    p.set('pagination[page]', String(page || 1));
  
    // Keep this minimal while debugging; add back fields/populate later
    // p.set('fields[0]', 'title');
    // p.set('fields[1]', 'slug');
    // p.set('fields[2]', 'summary');
    // p.set('fields[3]', 'published');
    // If you DO have a coverImage relation, then:
    // p.set('populate[coverImage]', 'true');
  
    return p.toString();
  }
  

  const [{ data: articles, meta }, { data: themes }, { data: keywords }] =
    await Promise.all([
      fetchJSON(`/api/articles?${query}`),                              // results
      fetchJSON('/api/themes?fields[0]=name&fields[1]=slug&sort=name:asc&pagination[pageSize]=100'),
      fetchJSON('/api/keywords?fields[0]=name&fields[1]=slug&sort=name:asc&pagination[pageSize]=200'),
    ]);

  const total = meta?.pagination?.total ?? 0;
  const pageCount = meta?.pagination?.pageCount ?? 1;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Knowledge Library</h1>

      {/* Filters */}
      <Filters
        q={q}
        theme={theme}
        selectedkeywords={keywordsArray}
        sort={sort}
        themes={themes}
        keywords={keywords}
      />

      {/* Results */}
      <ul className="mt-6 space-y-6">
        {articles.map((a: any) => {
          const cover = a.coverImage;
          return (
            <li key={a.id} className="border rounded-xl p-4">
              <div className="flex gap-4">
                {cover?.url && (
                  <div className="w-40 shrink-0 relative aspect-[16/10]">
                    <Image
                      src={cover.url.startsWith('http') ? cover.url : `${API_URL}${cover.url}`}
                      alt={a.title || ''}
                      fill
                      sizes="(max-width: 768px) 40vw, 200px"
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-xl font-medium">
                    <Link href={`/library/${a.slug}`} className="hover:underline">
                      {a.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-500">
                    {a.published ? new Date(a.published).toLocaleDateString() : null}
                  </p>
                  {a.summary ? (
                    <div className="mt-2 text-gray-700 line-clamp-3">
                      <BlocksRenderer content={a.summary} />
                    </div>
                  ) : null}
                  {/* keyword pills (optional) */}
                  {Array.isArray(a.keywords) && a.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {a.keywords.map((t: any) => (
                        <Link
                          key={t.id}
                          href={{ pathname: '/library', query: { ...sp, keywords: [...new Set([...keywordsArray, t.slug])], page: 1 } } as any}
                          className="text-xs bg-gray-100 rounded-full px-2 py-1"
                        >
                          #{t.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Pagination */}
      <Pagination page={page} pageCount={pageCount} sp={sp} />
      <p className="mt-4 text-sm text-gray-500">{total} results</p>
    </main>
  );
}

/** --- Filters (server component + GET form) --- */
function Filters({
  q,
  theme,
  selectedkeywords,
  sort,
  themes,
  keywords,
}: {
  q: string;
  theme: string;
  selectedkeywords: string[];
  sort: string;
  themes: any[];
  keywords: any[];
}) {
  // We'll submit a GET form so the URL reflects filters (nice for sharing)
  return (
    <form method="get" className="grid gap-3 sm:grid-cols-4">
      {/* Search */}
      <input
        type="search"
        name="q"
        placeholder="Search articles…"
        defaultValue={q}
        className="border rounded-md px-3 py-2 sm:col-span-2"
      />

      {/* theme */}
      <select name="theme" defaultValue={theme} className="border rounded-md px-3 py-2">
        <option value="">All themes</option>
        {themes.map((c: any) => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>

      {/* Sort */}
      <select name="sort" defaultValue={sort} className="border rounded-md px-3 py-2">
        <option value="published:desc">Newest</option>
        <option value="published:asc">Oldest</option>
        <option value="title:asc">Title A–Z</option>
        <option value="title:desc">Title Z–A</option>
      </select>

      {/* keywords (simple multi-select) */}
      <div className="sm:col-span-4">
        <label className="block text-sm mb-1">keywords</label>
        <div className="flex flex-wrap gap-2">
          {keywords.map((t: any) => {
            const checked = selectedkeywords.includes(t.slug);
            return (
              <label key={t.id} className="inline-flex items-center gap-1 border rounded-full px-2 py-1">
                <input
                  type="checkbox"
                  name="keywords"
                  value={t.slug}
                  defaultChecked={checked}
                />
                <span className="text-sm">#{t.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Reset + Apply */}
      <div className="sm:col-span-4 flex gap-2">
        <button className="border rounded-md px-3 py-2" type="submit">Apply</button>
        <Link href="/library" className="border rounded-md px-3 py-2">Reset</Link>
      </div>

      {/* Force page back to 1 on every filter submit */}
      <input type="hidden" name="page" value="1" />
    </form>
  );
}

/** --- Pagination --- */
function Pagination({ page, pageCount, sp }: { page: number; pageCount: number; sp: Record<string, any> }) {
  if (pageCount <= 1) return null;
  const prev = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);

  const toQuery = (p: number) => {
    const q = new URLSearchParams();
    Object.entries(sp || {}).forEach(([k, v]) => {
      if (k === 'page') return;
      if (Array.isArray(v)) v.forEach((item) => q.append(k, String(item)));
      else if (v != null && v !== '') q.set(k, String(v));
    });
    q.set('page', String(p));
    return `/library?${q.toString()}`;
  };

  return (
    <nav className="mt-6 flex items-center gap-2">
      <Link href={toQuery(prev)} className="border rounded-md px-3 py-2" aria-disabled={page === 1}>
        Prev
      </Link>
      <span className="px-2">Page {page} / {pageCount}</span>
      <Link href={toQuery(next)} className="border rounded-md px-3 py-2" aria-disabled={page === pageCount}>
        Next
      </Link>
    </nav>
  );
}
