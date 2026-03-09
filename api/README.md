# API

An application-accessible API proxy for the SoundCloud API.

**Stack:** [Bun](https://bun.sh) (zero runtime dependencies).

## Quickstart

```bash
bun install
bun run dev
```

Uses `../.env` for `SOUNDCLOUD_CLIENT_ID` and `SOUNDCLOUD_SECRET` via `--env-file=../.env`.

## Scripts

| Command            | Description                    |
|--------------------|--------------------------------|
| `bun run dev`      | Run from source with env file  |
| `bun run build`    | Bundle to `dist/` via Bun      |
| `bun run start`    | Run compiled `dist/app.js`     |
| `bun run lint`     | Run ESLint                     |
| `bun run typecheck`| Type-check without emitting    |

## Docker

```bash
docker build -t api-server .
docker run -t -i \
  --env SOUNDCLOUD_CLIENT_ID=... \
  --env SOUNDCLOUD_SECRET=... \
  -p 3000:8080 \
  api-server
```

Then:

```bash
curl "localhost:3000/proxy/playlists?q=test" | jq
```

## Fly Deployment

```bash
flyctl launch --remote-only --no-deploy --auto-confirm \
  --dockerfile Dockerfile --path . -r $REGION --copy-config --org $ORG --name $APP_NAME

flyctl secrets set -a $APP_NAME --stage \
  SOUNDCLOUD_CLIENT_ID=... SOUNDCLOUD_SECRET=...

flyctl deploy --remote-only -a $APP_NAME --config fly.toml --dockerfile Dockerfile
```
