const SOUNDCLOUD_TOKEN_URL = "https://secure.soundcloud.com/oauth/token"
const BUFFER_SECONDS = 10

interface TokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
}

interface TokenState {
  accessToken: string
  refreshToken: string | null
  expiresAtMs: number
}

function b64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64")
}

export function createTokenService(clientId: string, clientSecret: string) {
  let state: TokenState | null = null
  let fetchPromise: Promise<string> | null = null

  async function fetchToken(body: URLSearchParams): Promise<TokenResponse> {
    const basicAuth = b64(`${clientId}:${clientSecret}`)
    const response = await fetch(SOUNDCLOUD_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json; charset=utf-8",
        Authorization: `Basic ${basicAuth}`,
      },
      body,
    })

    if (!response.ok) {
      const text = await response.text()
      if (response.status === 429) {
        console.warn("SoundCloud token rate limited (429). Wait before retrying.")
      }
      throw new Error(`SoundCloud token failed (${response.status}): ${text}`)
    }

    return (await response.json()) as TokenResponse
  }

  async function fetchAndStore(): Promise<string> {
    let data: TokenResponse

    if (state?.refreshToken) {
      try {
        data = await fetchToken(
          new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: state.refreshToken,
          })
        )
      } catch {
        console.warn("SoundCloud refresh failed, falling back to client_credentials")
        data = await fetchToken(
          new URLSearchParams({ grant_type: "client_credentials" })
        )
      }
    } else {
      console.log("Fetching SoundCloud token (client_credentials)")
      data = await fetchToken(
        new URLSearchParams({ grant_type: "client_credentials" })
      )
    }

    state = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      expiresAtMs: Date.now() + (data.expires_in - BUFFER_SECONDS) * 1000,
    }
    console.log(`SoundCloud token ok, expires: ${new Date(state.expiresAtMs).toUTCString()}`)
    return state.accessToken
  }

  return async function getToken(): Promise<string> {
    if (state && state.expiresAtMs > Date.now() && state.accessToken) {
      return state.accessToken
    }

    // Deduplicate concurrent token fetches
    if (!fetchPromise) {
      fetchPromise = fetchAndStore().finally(() => {
        fetchPromise = null
      })
    }
    return fetchPromise
  }
}
