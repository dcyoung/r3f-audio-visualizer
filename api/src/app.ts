import * as Http from "node:http"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http"
import { NodeHttpServer } from "@effect/platform-node"
import { getConfig } from "./config.js"
import { SoundCloudToken, SoundCloudTokenLive } from "./soundcloud.js"

const SOUNDCLOUD_API = "https://api.soundcloud.com"

const config = getConfig()

const proxyHandler = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest
  const tokenService = yield* SoundCloudToken
  const token = yield* tokenService.getToken()
  const client = yield* HttpClient.HttpClient

  const pathAndQuery = req.url.startsWith("/proxy")
    ? req.url.slice("/proxy".length) || "/"
    : req.url
  const targetUrl = `${SOUNDCLOUD_API}${pathAndQuery}`

  yield* Effect.log(`Proxying request to SoundCloud: ${pathAndQuery}`)

  const request = HttpClientRequest.make(
    req.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE"
  )(targetUrl, {
    headers: {
      ...Object.fromEntries(
        Object.entries(req.headers).filter(
          ([k]) => k.toLowerCase() !== "host" && k.toLowerCase() !== "connection"
        )
      ) as Record<string, string>,
      Authorization: `OAuth ${token}`,
    },
  })

  const response = yield* client.execute(request).pipe(
    Effect.mapError((e) => new Error(e.message))
  )

  const body = yield* response.arrayBuffer.pipe(
    Effect.mapError((e) => new Error(String(e)))
  )

  if (response.status === 429) {
    yield* Effect.try({
      try: () => JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>,
      catch: (e) => e,
    }).pipe(
      Effect.match({
        onSuccess: (json) =>
          Effect.logWarning(
            "SoundCloud stream rate limit (429):",
            json.remaining_requests != null && `remaining=${json.remaining_requests}`,
            json.reset_time != null && `resets=${json.reset_time}`,
            json
          ),
        onFailure: () => Effect.logWarning("SoundCloud stream rate limit (429)"),
      })
    )
  }

  const headers: Record<string, string> = { "Access-Control-Allow-Origin": "*" }
  const skipHeaders = new Set(["content-encoding", "content-length"])
  for (const [k, v] of Object.entries(response.headers)) {
    if (v !== undefined && !skipHeaders.has(k.toLowerCase())) headers[k] = v
  }

  return HttpServerResponse.uint8Array(new Uint8Array(body), {
    status: response.status,
    headers,
  })
})

const healthzHandler = HttpServerResponse.json(
  { healthy: true },
  { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
)

const app = Effect.gen(function* () {
  const router = yield* HttpRouter.make
  yield* router.add("GET", "/healthz", healthzHandler)
  yield* router.add("*", "/proxy/*", proxyHandler)
  yield* HttpServer.serveEffect(router.asHttpEffect())
  yield* HttpServer.logAddress
  yield* Effect.never
})

const mainLayer = Layer.mergeAll(
  NodeHttpServer.layer(() => Http.createServer(), { port: config.PORT }),
  FetchHttpClient.layer,
  SoundCloudTokenLive(config).pipe(Layer.provide(FetchHttpClient.layer))
)

const program = Effect.scoped(
  app.pipe(
    Effect.provide(mainLayer),
    Effect.catchCause((cause) => Effect.logError(cause))
  )
) as Effect.Effect<void, never, never>

Effect.runPromise(program).catch((e) => {
  Effect.runSync(Effect.logError(Cause.die(e)))
  process.exit(1)
})
