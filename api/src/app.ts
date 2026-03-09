import { getConfig } from "./config.js"
import { createTokenService } from "./soundcloud.js"

const SOUNDCLOUD_API = "https://api.soundcloud.com"
const SKIP_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-expose-headers",
])

const config = getConfig()
const getToken = createTokenService(config.SOUNDCLOUD_CLIENT_ID, config.SOUNDCLOUD_SECRET)

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" } as const

function proxyHeaders(upstream: Response): Record<string, string> {
  const headers: Record<string, string> = { ...CORS_HEADERS }
  upstream.headers.forEach((v, k) => {
    if (!SKIP_HEADERS.has(k.toLowerCase())) headers[k] = v
  })
  return headers
}

async function handleProxy(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const pathAndQuery = url.pathname.replace(/^\/proxy/, "") || "/"
  const targetUrl = `${SOUNDCLOUD_API}${pathAndQuery}${url.search}`

  console.log(`Proxying: ${pathAndQuery}${url.search}`)

  const token = await getToken()

  const upstreamHeaders = new Headers()
  req.headers.forEach((v, k) => {
    if (k !== "host" && k !== "connection") upstreamHeaders.set(k, v)
  })
  upstreamHeaders.set("Authorization", `OAuth ${token}`)

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: upstreamHeaders,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    redirect: "follow",
  })

  if (upstream.status === 429) {
    const body = await upstream.text()
    try {
      const json = JSON.parse(body) as Record<string, unknown>
      console.warn(
        "SoundCloud rate limit (429):",
        json.remaining_requests != null ? `remaining=${json.remaining_requests}` : "",
        json.reset_time != null ? `resets=${json.reset_time}` : "",
      )
    } catch {
      console.warn("SoundCloud rate limit (429)")
    }
    return new Response(body, {
      status: 429,
      headers: proxyHeaders(upstream),
    })
  }

  // Stream the response body through without buffering
  return new Response(upstream.body, {
    status: upstream.status,
    headers: proxyHeaders(upstream),
  })
}

const server = Bun.serve({
  port: config.PORT,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === "/healthz") {
      return Response.json({ healthy: true }, { headers: CORS_HEADERS })
    }

    if (url.pathname.startsWith("/proxy")) {
      try {
        return await handleProxy(req)
      } catch (err) {
        console.error("Proxy error:", err)
        return Response.json(
          { error: "proxy error" },
          { status: 502, headers: CORS_HEADERS },
        )
      }
    }

    return new Response("Not Found", { status: 404 })
  },
})

console.log(`Listening on http://0.0.0.0:${server.port}`)

setInterval(() => {
  const mem = process.memoryUsage()
  console.log(
    `[memory] rss=${(mem.rss / 1024 / 1024).toFixed(1)}MB heap=${(mem.heapUsed / 1024 / 1024).toFixed(1)}/${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,
  )
}, 60_000)
