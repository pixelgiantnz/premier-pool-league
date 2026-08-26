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

- Visit `/admin/register` to create the **Master Admin** (you are signed in automatically)
- Set **Platform password** + **Kiosk password** at `/admin/settings`
- Sign out, then use `/gate` with the Platform password (Viewer)
- Use **Unlock Kiosk** with the Kiosk password

To sign in again later, use `/admin/login` with your Master Admin email and password.

### Master Admin password reset

If you cannot sign in, set a reset secret on your Convex deployment (once):

```bash
npx convex env set MASTER_ADMIN_RESET_SECRET "pick-a-long-random-secret"
```

Then visit `/admin/reset-password`, enter your email, a new Master Admin password, and the reset secret. Platform and Kiosk passwords are unchanged.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js + Convex dev servers |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest (domain auth tier tests) |
| `npm run build` | Production build |

Stack: Next.js, Convex, Vitest — see `docs/adr/0003-nextjs-convex-vitest.md`.
