import * as os from "os";
import * as path from "path";
import * as http from "http";
import * as https from "https";
import inspect from "logspect";
import * as express from "express";
import { BoomError, wrap } from "boom";
import { ISLIVE } from "./modules/constants";
import * as httpsRedirect from "redirect-https";
import * as letsEncrypt from "letsencrypt-express";
import { json as parseJson, urlencoded as parseUrlEncoded } from "body-parser";

// Server configurations
import configureCache from "./modules/cache";
import configureSkills from "./skills";
import configureRoutes from "./routes";
import configureDatabase from "./modules/database";

async function startServer(hostname: string, port: number, securePort: number) {
    const app = express();

    app.use((req, res, next) => {
        res.setHeader("x-powered-by", `Gearworks https://github.com/nozzlegear/gearworks`);

        next();
    });

    // Let express trust the proxy that may be used on certain hosts (e.g. Azure and other cloud hosts). 
    // Enabling this will replace the `request.protocol` with the protocol that was requested by the end user, 
    // rather than the internal protocol used by the proxy.
    app.enable("trust proxy");
    app.use(parseJson());
    app.use(parseUrlEncoded({ extended: true }));

    // Configure the server
    await configureCache();
    await configureDatabase();
    await configureSkills(app);
    await configureRoutes(app);

    // Wildcard route must be registered after all other routes.
    app.all("*", (req, res) => {
        if (res.finished) {
            return;
        }

        res.json({message: "This app is meant for Alexa, not for humans."});
    })

    // Typescript type guard for boom errors
    function isBoomError(err): err is BoomError {
        return err.isBoom;
    }

    // Register an error handler for all routes
    app.use(function (err: Error | BoomError, req: express.Request, res: express.Response, next: Function) {
        const fullError = isBoomError(err) ? err : wrap(err);

        if (fullError.output.statusCode >= 500) {
            inspect(`Error in ${req.url}`, err);
        }

        res.status(fullError.output.statusCode).json(fullError.output.payload);

        return next();
    } as any);

    // // Prepare encryption
    // const lexTempDir = path.join(os.tmpdir(), "acme-challenges");
    // const lex = letsEncrypt.create({
    //     // You must set server to https://acme-v01.api.letsencrypt.org/directory after you have tested that your setup works.
    //     server: (!ISLIVE) ? "staging" : "https://acme-v01.api.letsencrypt.org/directory",
    //     challenges: { 'tls-sni-01': require('le-challenge-sni').create({ webrootPath: lexTempDir }) },
    //     challengeType: 'tls-sni-01',
    //     store: require('le-store-certbot').create({ webrootPath: lexTempDir }),
    //     approveDomains: !ISLIVE ? ["127.0.0.1"] : ["alexa.nozzlegear.com"],
    //     email: `joshua@nozzlegear.com`,
    //     agreeTos: true,
    // });

    return http.createServer(app).listen(port, hostname);
}

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;
const securePort = process.env.SECURE_PORT || 3001;

startServer(host, port, securePort).then((server: https.Server | http.Server) => {
    inspect(`HTTP and HTTPS servers are listening on ${host}:${port} and ${host}:${securePort}.`);
}).catch(e => {
    inspect("Error starting server.", e);
});