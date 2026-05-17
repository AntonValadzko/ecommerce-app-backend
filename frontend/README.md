# Product Catalog Frontend

Next.js 15 + React 19 + TypeScript storefront for the Product Catalog API.

## Features

- Product listing with grid layout
- Search with autocomplete (name, description, SKU, brand)
- Filters: category, price range, brands, rating, attributes, in-stock
- Sorting and page size (24 / 48 / 96)
- Pagination and infinite scroll modes
- Quick view modal
- Product detail pages with SEO (metadata + JSON-LD)
- Saved searches (session-based)
- Related products

## Prerequisites

Start the backend API first (port **3000**):

```bash
# from project root
npm run dev
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3001

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:3000` | Backend URL for SSR and rewrites |
| `NEXT_PUBLIC_API_BASE` | `/api/v1` | Browser API path (proxied via Next.js) |

Copy `.env.local.example` to `.env.local` to customize.

## Tech stack

- **Next.js 15** App Router
- **React 19** with client/server components
- **TypeScript** strict mode
- **Tailwind CSS**
- **SWR** for client data fetching
- URL-driven filter state (shareable links)
