# Frontend (development)

This folder contains the frontend source used by the monorepo Vite setup (dev server root is `./frontend`).

Quick start (from repo root):

```bash
npm install
npm run dev
```

The dev server runs Vite with `root: ./frontend` (see `vite.config.ts`) and serves the SPA.

Environment & OpenAI
- The app uses a simple proxy endpoint at `/api/chat` for communicating with OpenAI when running on a server that exposes that route (for local dev you can use a small proxy or set the `OPENAI_API_KEY` in your deployment environment).
- Do NOT commit your API keys. Use environment variables in Vercel or a `.env` (gitignored) during local development.

Local OpenAI proxy
- A small Express proxy is included at `server/proxy.js`. To run it locally set an `.env` file at repo root with:

```
OPENAI_API_KEY=your_api_key_here
```

Then in one terminal run the proxy:

```bash
npm run proxy
```

And in another terminal run the dev server:

```bash
npm run dev
```

The frontend will call `/api/chat` on the same origin — the proxy runs on port `3001` by default; when testing locally you may need to configure a simple rewrite or call the proxy URL directly (e.g., `http://localhost:3001/api/chat`).

Notes
- UI lives under `frontend/src` using an atomic structure (`atoms/`, `molecules/`, `organisms/`, `templates/`).
- To migrate to Next.js later we designed components to be easy to move into `app/` pages and `app/api` routes.
