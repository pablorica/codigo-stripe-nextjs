
# Codigo

A modern blog application powered by:

- **Strapi** (headless CMS)
- **Next.js (App Router)** for the frontend
- **TypeScript**, **fetch**, and `.env` configuration

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/pablorica/codigo-stripe-nextjs.git
cd my-blog
```

---

##  Backend – Strapi (Headless CMS)

###  Install Strapi

```bash
npx create-strapi-app@latest my-strapi-blog --quickstart
```

This sets up Strapi with SQLite and launches the admin panel at:

```
http://localhost:1337/admin
```

###  Create Content Type: `Post`

1. Open the **Content-Type Builder** in the admin panel.
2. Add a new type called `Post` with the following fields:

   * `title` (Text)
   * `content` (Rich Text)
   * `slug` (UID)
   * `publishedAt` (Date)
3. Save and restart.

###  Add Content

* Go to **Content Manager > Post**
* Add and **publish** at least one blog post

###  Set Public Permissions

1. Go to **Settings → Roles → Public**
2. Enable `find` and `findOne` for the `Post` collection type
3. Save

---

##  Frontend – Next.js

### Install dependencies

```bash
pnpm install
```

### Configure API URL

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
```

###  Run the app

```bash
pnpm dev
```

Visit:
➡️ `http://localhost:3000` – Blog homepage
➡️ `http://localhost:3000/posts` – Posts page (if implemented)



Awesome! 🎉 Glad it’s all working now. Here's an updated `README.md` section you can **append** or **replace** in your project to document the full Strapi integration — especially how to get nested media and components properly from the API.

---

##  Strapi Integration & API Fetching Guide

### ✅ API Setup for Full Content Retrieval

To fetch all required nested content (like `backgroundVideo`, `ctas`, and deeply populated `team` members with `photo` and `social links`), you need to use the correct `populate` query string in your request.

**Example API call:**

```ts
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/homepages?populate[backgroundVideo][populate]=*&populate[ctas][populate]=*&populate[team][populate]=*`,
  { cache: 'no-store' }
);
```

This ensures:

* `backgroundVideo`: The media file object is fully included.
* `ctas`: Any nested links or structured content are loaded.
* `team`: Each team member includes their `photo` and `social` links.



### .env Configuration

Your `.env.local` should include:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
```



### Image Rendering with `next/image`

If your Strapi media lives at `http://localhost:1337`, you need to explicitly allow this domain in `next.config.js`:

```js
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
```

Then use `next/image` safely:

```tsx
<Image
  src={`${API_URL}${member.photo.url}`}
  alt={member.name}
  width={member.photo.width}
  height={member.photo.height}
/>
```



### Troubleshooting

If you’re not seeing nested fields like `photo` or `social` in your response:

* Make sure the field types in Strapi are correctly configured (e.g., media is set to "single media", relations are set properly).
* Double-check the `populate` structure.
* Use the API browser at `http://localhost:1337/api/homepages` to confirm the JSON structure.

---

##  Technologies Used

* [Strapi](https://strapi.io/) – Headless CMS
* [Next.js](https://nextjs.org/) – React Framework
* [TypeScript](https://www.typescriptlang.org/)
* [@strapi/blocks-react-renderer](https://www.npmjs.com/package/@strapi/blocks-react-renderer) – Rich text rendering

---

## Deployment Notes

* You can deploy Strapi separately (e.g., on Render, Heroku, or a VPS).
* Deploy the Next.js frontend on [Vercel](https://vercel.com/) or Netlify.
* Be sure to update your `NEXT_PUBLIC_API_URL` with the production Strapi API URL.

---

## Credits

Built by Pablo Rica.
Inspired by modern headless CMS workflows with React & Next.js.

## License

