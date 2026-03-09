#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
ENV_FILE="${REPO_ROOT}/.env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

IMAGE_NAME="sc-proxy-test"
CONTAINER_NAME="sc-proxy-memtest"
PORT=8080
PROXY="http://localhost:${PORT}/proxy"
HEALTH="http://localhost:${PORT}/healthz"

# --- Check for .env ---
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env file not found at ${ENV_FILE}"
  echo "  Create it with SOUNDCLOUD_CLIENT_ID and SOUNDCLOUD_SECRET"
  exit 1
fi
echo "Using env file: ${ENV_FILE}"

cleanup() {
  echo ""
  echo "=== Cleaning up ==="
  docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
}
trap cleanup EXIT

# --- Build ---
echo "=== Building Docker image ==="
docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"

# --- Run ---
echo ""
echo "=== Starting container (256MB memory limit, matching Fly free tier) ==="
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
docker run -d \
  --name "$CONTAINER_NAME" \
  --memory=256m \
  --memory-swap=384m \
  --env-file "$ENV_FILE" \
  -e PORT="$PORT" \
  -p "${PORT}:${PORT}" \
  "$IMAGE_NAME"

# --- Wait for healthy ---
echo ""
echo "=== Waiting for container to be healthy ==="
for i in $(seq 1 30); do
  if curl -sf "$HEALTH" > /dev/null 2>&1; then
    echo "  Healthy after ${i}s"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "  FAILED: container never became healthy"
    docker logs "$CONTAINER_NAME"
    exit 1
  fi
  sleep 1
done

# --- Helper: print memory stats ---
print_mem() {
  local label="$1"
  local stats
  stats=$(docker stats "$CONTAINER_NAME" --no-stream --format '{{.MemUsage}} ({{.MemPerc}})' 2>/dev/null || echo "N/A")
  printf "  [mem @ %-30s] %s\n" "$label" "$stats"
}

# --- Background memory monitor ---
monitor_mem() {
  while true; do
    print_mem "background"
    sleep 2
  done
}
monitor_mem &
MONITOR_PID=$!
trap 'kill $MONITOR_PID 2>/dev/null; cleanup' EXIT

echo ""
echo "=== Baseline memory ==="
print_mem "baseline"

# --- Test 1: Healthz ---
echo ""
echo "=== Test 1: Healthz ==="
curl -sf "$HEALTH" | head -c 200
echo ""
print_mem "after-healthz"

# --- Test 2: Search tracks directly ---
echo ""
echo "=== Test 2: Search tracks (small JSON response) ==="
TRACKS_RESPONSE=$(curl -sf "${PROXY}/tracks?q=lofi+chill&limit=5&access=playable" || echo "FAILED")
TRACKS_COUNT=$(echo "$TRACKS_RESPONSE" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "  Response size: $(echo "$TRACKS_RESPONSE" | wc -c | tr -d ' ') bytes (${TRACKS_COUNT} tracks)"
print_mem "after-track-search"

# --- Test 3: Get stream URL for first track ---
echo ""
echo "=== Test 3: Get stream URL ==="
TRACK_ID=$(echo "$TRACKS_RESPONSE" | python3 -c "import sys,json; tracks=json.load(sys.stdin); print(tracks[0]['id'])" 2>/dev/null || echo "")
if [[ -z "$TRACK_ID" ]]; then
  echo "  SKIP: no tracks found — cannot test streaming"
else
  echo "  Track ID: $TRACK_ID"
  STREAMS_RESPONSE=$(curl -sf "${PROXY}/tracks/${TRACK_ID}/streams" || echo "FAILED")
  echo "  Response size: $(echo "$STREAMS_RESPONSE" | wc -c | tr -d ' ') bytes"
  echo "  Preview: $(echo "$STREAMS_RESPONSE" | head -c 300)"
  echo ""

  MP3_URL=$(echo "$STREAMS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
url = data.get('http_mp3_128_url', '')
print(url.replace('https://api.soundcloud.com', '${PROXY}'))
" 2>/dev/null || echo "")

  if [[ -z "$MP3_URL" || "$MP3_URL" == "${PROXY}" ]]; then
    echo "  SKIP: could not extract mp3 stream URL"
  else
    print_mem "before-stream"

    # --- Test 4: Stream MP3 through proxy (partial, 10s max) ---
    echo ""
    echo "=== Test 4: Stream single MP3 through proxy (max 10s) ==="
    echo "  URL: $MP3_URL"
    STREAM_SIZE=$(curl -sf --max-time 10 "$MP3_URL" 2>/dev/null | wc -c | tr -d ' ')
    echo "  Downloaded: ${STREAM_SIZE} bytes"
    print_mem "after-single-stream"

    # --- Test 5: Concurrent MP3 streams ---
    echo ""
    echo "=== Test 5: 5 concurrent MP3 streams (max 15s each) ==="
    print_mem "before-concurrent"
    CURL_PIDS=()
    for i in $(seq 1 5); do
      curl -sf --max-time 15 "$MP3_URL" -o /dev/null 2>/dev/null &
      CURL_PIDS+=($!)
    done
    sleep 5
    print_mem "during-concurrent"
    wait "${CURL_PIDS[@]}" 2>/dev/null || true
    print_mem "after-concurrent"

    # --- Test 6: Burst of 10 concurrent streams ---
    echo ""
    echo "=== Test 6: 10 concurrent MP3 streams (stress, max 15s each) ==="
    print_mem "before-stress"
    CURL_PIDS=()
    for i in $(seq 1 10); do
      curl -sf --max-time 15 "$MP3_URL" -o /dev/null 2>/dev/null &
      CURL_PIDS+=($!)
    done
    sleep 5
    print_mem "during-stress"
    wait "${CURL_PIDS[@]}" 2>/dev/null || true
    print_mem "after-stress"

    # --- Cooldown: verify memory returns toward baseline ---
    echo ""
    echo "=== Cooldown (30s, with periodic healthz pings to nudge GC) ==="
    for i in $(seq 1 10); do
      sleep 3
      curl -sf "$HEALTH" > /dev/null 2>&1
      print_mem "cooldown-${i}"
    done
  fi
fi

# --- Container logs ---
echo ""
echo "=== Container logs (last 40 lines) ==="
docker logs --tail 40 "$CONTAINER_NAME"

echo ""
echo "=== Done ==="
