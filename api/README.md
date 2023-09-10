# API

An application accessible API proxy to the soundcloud API.   

## Quickstart

```bash
npm install
npm run dev
```

## Run with docker:

```bash
docker build -t api-server .
docker run -t -i \
      --env SOUNDCLOUD_CLIENT_ID=... \
      --env SOUNDCLOUD_SECRET=... \
      -p 3000:8080 \
      api-server
```

Then, the equivalent of:

```bash
curl "https://api.soundcloud.com/playlists?q=test" \
      -H "Authorization: OAuth <AUTH_TOKEN>" \
      | jq
```

becomes...

```bash
curl "localhost:3000/proxy/playlists?q=test" | jq
```

## Fly Deployment

```bash
APP_NAME="CHANGE_ME"
REGION="CHANGE_ME"
ORG="CHANGE_ME"

flyctl launch \
      --remote-only \
      --no-deploy \
      --auto-confirm \
      --dockerfile Dockerfile \
      --path . \
      -r $REGION \
      --copy-config \
      --org $ORG \
      --name $APP_NAME

flyctl secrets set \
      -a $APP_NAME \
      --stage \
      SOUNDCLOUD_CLIENT_ID=CHANGE_ME \
      SOUNDCLOUD_SECRET=CHANGE_ME

flyctl deploy \
      --remote-only \
      -a $APP_NAME \
      --config fly.toml \
      --dockerfile Dockerfile
```