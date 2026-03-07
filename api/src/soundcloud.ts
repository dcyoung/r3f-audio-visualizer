import { z } from 'zod';

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class ScTokenFetcher {
    private token: string = "";
    private refreshToken: string = "";
    private expirationAtMs: number = 0;
    private isFetching: boolean = false;

    constructor() {
        this.getToken();
    }

    private isTokenValid() {
        return this.token && this.token !== "" && Date.now() < this.expirationAtMs;
    }

    private async waitForValidToken(timeoutMs: number = 10000, checkIntervalMs: number = 25) {
        const end = Date.now() + timeoutMs;
        while (Date.now() < end) {
            if (this.isTokenValid()) {
                return this.token;
            }
            await delay(checkIntervalMs);
        }
        throw new Error("timeout waiting for valid token");
    }

    private async requestTokenWithRefresh(): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
        const clientId = process.env.SOUNDCLOUD_CLIENT_ID!;
        const clientSecret = process.env.SOUNDCLOUD_SECRET!;
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        const response = await fetch("https://secure.soundcloud.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json; charset=utf-8",
                Authorization: `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: this.refreshToken,
            }),
        });

        const raw = await response.json();
        if (!response.ok) {
            if (response.status === 429) {
                console.warn("SoundCloud refresh token rate limited (429). Wait before retrying.");
            }
            throw new Error(`Refresh failed (${response.status}): ${JSON.stringify(raw)}`);
        }

        return z.object({
            access_token: z.string(),
            expires_in: z.number(),
            refresh_token: z.string().optional(),
        }).parse(raw);
    }

    private async requestTokenWithClientCredentials(): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
        const clientId = process.env.SOUNDCLOUD_CLIENT_ID!;
        const clientSecret = process.env.SOUNDCLOUD_SECRET!;
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        const response = await fetch("https://secure.soundcloud.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json; charset=utf-8",
                Authorization: `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({ grant_type: "client_credentials" }),
        });

        const raw = await response.json();
        if (!response.ok) {
            if (response.status === 429) {
                console.warn("SoundCloud client_credentials quota exceeded (429). Limits: 50 tokens/12h per app, 30/1h per IP.");
            }
            const err = typeof raw === "object" && raw && "error" in raw
                ? `${(raw as { error?: string }).error}: ${JSON.stringify(raw)}`
                : String(raw);
            throw new Error(`SoundCloud token request failed (${response.status}): ${err}`);
        }

        return z.object({
            access_token: z.string(),
            expires_in: z.number(),
            refresh_token: z.string().optional(),
        }).parse(raw);
    }

    public async getToken() {
        if (this.isTokenValid()) {
            return this.token;
        }

        if (this.isFetching) {
            return this.waitForValidToken();
        }

        this.isFetching = true;
        try {
            let data: { access_token: string; expires_in: number; refresh_token?: string };

            if (this.refreshToken) {
                try {
                    console.log("refreshing SoundCloud token");
                    data = await this.requestTokenWithRefresh();
                } catch (e) {
                    console.warn("SoundCloud refresh failed, falling back to client_credentials:", (e as Error).message);
                    this.refreshToken = "";
                    data = await this.requestTokenWithClientCredentials();
                }
            } else {
                console.log("fetching new token from SoundCloud (client_credentials)");
                data = await this.requestTokenWithClientCredentials();
            }

            this.token = data.access_token;
            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
            }
            this.expirationAtMs = Date.now() + ((data.expires_in - 10) * 1000);
            console.log(`SoundCloud token ok, expires: ${new Date(this.expirationAtMs).toUTCString()}`);
            return this.token;
        } finally {
            this.isFetching = false;
        }
    }
}

const TOKEN_FETCHER = new ScTokenFetcher();

export const getSoundcloudToken = async () => {
    return await TOKEN_FETCHER.getToken();
};
