import { z } from 'zod';
import { createZodFetcher } from "zod-fetch";

const fetchWithZod = createZodFetcher();

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class ScTokenFetcher {
    private token: string = "";
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

    public async getToken() {
        if (this.isTokenValid()) {
            return this.token;
        }

        if (this.isFetching) {
            return this.waitForValidToken();
        }

        this.isFetching = true;
        console.log("fetching new token from soundcloud");

        const form = {
            client_id: process.env.SOUNDCLOUD_CLIENT_ID!,
            client_secret: process.env.SOUNDCLOUD_SECRET!,
            grant_type: 'client_credentials',
            test: 'true',
        };

        const data = await fetchWithZod(
            z.object({
                access_token: z.string(),
                expires_in: z.number(),
                // refresh_token: z.string(),
                // scope: z.string(),
                // token_type: z.string(),
            }),
            'https://api.soundcloud.com/oauth2/token',
            {
                method: 'POST',
                body: new URLSearchParams(form),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        this.token = data.access_token;
        this.expirationAtMs = Date.now() + ((data.expires_in - 10) * 1000);
        this.isFetching = false;
        console.log(`Successfully fetched new token from soundcloud... expires: [${new Date(this.expirationAtMs).toUTCString()}]`);
        return this.token;
    }
}

const TOKEN_FETCHER = new ScTokenFetcher();

export const getSoundcloudToken = async () => {
    return await TOKEN_FETCHER.getToken();
}

// headers: {
//     'Authorization': `OAuth ${token}`,
// },
