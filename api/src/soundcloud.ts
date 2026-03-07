import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Schema from "effect/Schema"
import * as ServiceMap from "effect/ServiceMap"
import {
  HttpBody,
  HttpClient,
  HttpClientRequest,
  HttpIncomingMessage,
  UrlParams,
} from "effect/unstable/http"

const SOUNDCLOUD_TOKEN_URL = "https://secure.soundcloud.com/oauth/token"
const BUFFER_SECONDS = 10

const TokenResponseSchema = Schema.Struct({
  access_token: Schema.String,
  expires_in: Schema.Number,
  refresh_token: Schema.optionalKey(Schema.String),
})
type TokenResponse = Schema.Schema.Type<typeof TokenResponseSchema>

interface TokenState {
  accessToken: string
  refreshToken: Option.Option<string>
  expiresAtMs: number
}

export interface ISoundCloudToken {
  getToken: () => Effect.Effect<string, Error, HttpClient.HttpClient>
}

export const SoundCloudToken = ServiceMap.Service<ISoundCloudToken>("app/SoundCloudToken")

function b64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64")
}

function fetchToken(
  clientId: string,
  clientSecret: string,
  body: URLSearchParams
): Effect.Effect<TokenResponse, Error, HttpClient.HttpClient> {
  const basicAuth = b64(`${clientId}:${clientSecret}`)
  return Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const request = HttpClientRequest.post(SOUNDCLOUD_TOKEN_URL, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json; charset=utf-8",
        Authorization: `Basic ${basicAuth}`,
      },
      body: HttpBody.urlParams(UrlParams.fromInput(body)),
    })
    const response = yield* client.execute(request).pipe(
      Effect.mapError((e) => new Error(e.message))
    )
    if (response.status < 200 || response.status >= 300) {
      const text = yield* response.text.pipe(Effect.mapError((e) => new Error(String(e))))
      if (response.status === 429) {
        yield* Effect.logWarning("SoundCloud token rate limited (429). Wait before retrying.")
      }
      return yield* Effect.fail(new Error(`SoundCloud token failed (${response.status}): ${text}`))
    }
    return yield* HttpIncomingMessage.schemaBodyJson(TokenResponseSchema)(response).pipe(
      Effect.mapError((e) => new Error(e.message))
    )
  })
}

export const SoundCloudTokenLive = (config: {
  SOUNDCLOUD_CLIENT_ID: string
  SOUNDCLOUD_SECRET: string
}) =>
  Layer.effect(SoundCloudToken)(
    Effect.gen(function* () {
      const stateRef = yield* Ref.make<Option.Option<TokenState>>(Option.none())
      const fetchingRef = yield* Ref.make(false)

      const getToken = (): Effect.Effect<string, Error, HttpClient.HttpClient> =>
        Effect.gen(function* () {
          const now = Date.now()
          const current = yield* Ref.get(stateRef)
          const valid = Option.filter(current, (s) => s.expiresAtMs > now && s.accessToken !== "")
          if (Option.isSome(valid)) {
            return valid.value.accessToken
          }

          const isFetching = yield* Ref.get(fetchingRef)
          if (isFetching) {
            yield* Effect.sleep("100 millis")
            return yield* getToken()
          }

          yield* Ref.set(fetchingRef, true)
          return yield* fetchAndStoreToken().pipe(
            Effect.ensuring(Ref.set(fetchingRef, false))
          )
        })

      const fetchAndStoreToken = (): Effect.Effect<string, Error, HttpClient.HttpClient> =>
        Effect.gen(function* () {
          let data: TokenResponse
          const current = yield* Ref.get(stateRef)
          const refreshToken = Option.flatMap(current, (s) => s.refreshToken)

          if (Option.isSome(refreshToken)) {
            data = yield* fetchToken(
              config.SOUNDCLOUD_CLIENT_ID,
              config.SOUNDCLOUD_SECRET,
              new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken.value,
              })
            ).pipe(
              Effect.catchCause(() =>
                Effect.gen(function* () {
                  yield* Effect.logWarning(
                    "SoundCloud refresh failed, falling back to client_credentials"
                  )
                  return yield* fetchToken(
                    config.SOUNDCLOUD_CLIENT_ID,
                    config.SOUNDCLOUD_SECRET,
                    new URLSearchParams({ grant_type: "client_credentials" })
                  )
                })
              )
            )
          } else {
            yield* Effect.log("Fetching SoundCloud token (client_credentials)")
            data = yield* fetchToken(
              config.SOUNDCLOUD_CLIENT_ID,
              config.SOUNDCLOUD_SECRET,
              new URLSearchParams({ grant_type: "client_credentials" })
            )
          }

          const state: TokenState = {
            accessToken: data.access_token,
            refreshToken:
              data.refresh_token !== undefined
                ? Option.some(data.refresh_token)
                : Option.none(),
            expiresAtMs: Date.now() + (data.expires_in - BUFFER_SECONDS) * 1000,
          }
          yield* Ref.set(stateRef, Option.some(state))
          yield* Effect.log(
            `SoundCloud token ok, expires: ${new Date(state.expiresAtMs).toUTCString()}`
          )
          return state.accessToken
        })

      return { getToken }
    })
  )
