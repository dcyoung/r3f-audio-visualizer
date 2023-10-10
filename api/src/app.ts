import express from 'express';
import proxy from 'express-http-proxy';

import { getSoundcloudToken } from './soundcloud';

const port = process.env.PORT || 3000;
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

/*
Example: 
    curl "https://api.soundcloud.com/playlists?q=test" -H "Authorization: OAuth <AUTH_TOKEN>"

will be proxied through:

    curl "localhost:3000/proxy/playlists?q=test"
*/
app.use("/proxy", proxy("https://api.soundcloud.com", {
    proxyReqOptDecorator: async (proxyReqOpts, srcReq) => {
        console.log(`Proxying request to Soundcloud: ${srcReq.path}`)
        const token = await getSoundcloudToken();
        proxyReqOpts.headers = { "Authorization": `OAuth ${token}` };
        return proxyReqOpts;
    }
}));

app.use("/healthz", (req, res) => {
    res.status(200).send({ "healthy": true });
});

const server = app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

app.on('error', (err) => {
    console.error(err);
});

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());