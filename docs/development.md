# Premier Pool League

See [README.md](./README.md) for the skills workflow. Application code lives under `src/` and `convex/`.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Link Convex (first time only — browser login required):

```bash
npx convex dev
```

This writes `.env.local` with `NEXT_PUBLIC_CONVEX_URL`.

3. Run the app:

```bash
npm run dev
```

4. Bootstrap flow:

- Visit `/admin/register` to create the **Master Admin**
- Sign in at `/admin/login` and set **Platform password** + **Kiosk password** at `/admin/settings`
- Sign out, then use `/gate` with the Platform password (Viewer)
- Use **Unlock Kiosk** with the Kiosk password

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js + Convex dev servers |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest (domain auth tier tests) |
| `npm run build` | Production build |

Stack: Next.js, Convex, Vitest — see `docs/adr/0003-nextjs-convex-vitest.md`.
