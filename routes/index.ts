import * as qs from "qs";
import * as joi from "joi";
import inspect from "logspect";
import { Express } from "express";
import { v4 as guid } from "node-uuid";
import getRouter from "gearworks-route";
import * as Db from "../modules/database";
import { Twitch, ApiError } from "../modules/api";
import * as Constants from "../modules/constants";

export default async function configureRoutes(app: Express) {
    const route = getRouter<any>(app, {
        iron_password: Constants.IRON_PASSWORD,
        jwt_secret_key: Constants.JWT_SECRET_KEY,
        shopify_secret_key: "empty",
    });
    const redirectUri = "https://alexa.nozzlegear.com/twitch/authorize";

    route({
        label: "Amazon OAuth authorization page",
        method: "get",
        path: "/streamcheck/oauth2/authorize",
        queryValidation: joi.object({
            state: joi.string().required(),
            client_id: joi.string().only("streamcheck-alexa-skill").required(),
            response_type: joi.string().only("token").required(),
            scope: joi.string().allow(""),
            redirect_uri: joi.string().only([
                "https://layla.amazon.com/spa/skill/account-linking-status.html?vendorId=M2DEEI35HP2KJ5",
                "https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=M2DEEI35HP2KJ5"
            ]).required(),
        }),
        handler: async function (req, res, next) {
            const query = req.validatedQuery as {
                state: string;
                client_id: "streamcheck-alexa-skill",
                response_type: "token",
                scope?: string,
                redirect_uri: string,
            };
            // Store the state and redirect_uri somewhere and give it an id that then gets passed as the state to the Twitch oauth URL.
            const storedRequest = await Db.AccountLinkDb.post({ redirect_uri: query.redirect_uri, state: query.state });

            // Redirect the user to the twitch OAuth page
            const twitchQuery = qs.stringify({
                response_type: "code",
                client_id: Constants.TWITCH_CLIENT_ID,
                scope: "user_read",
                state: storedRequest.id,
                force_verify: true,
                redirect_uri: redirectUri,
            });
            const twitchAuthUrl = `https://api.twitch.tv/kraken/oauth2/authorize?${twitchQuery}`;

            res.redirect(twitchAuthUrl);

            return next();
        }
    })

    route({
        label: "Authorize Twitch integration",
        method: "get",
        path: "/twitch/authorize",
        queryValidation: joi.object({
            code: joi.string().required(),
            state: joi.string().required(),
            scope: joi.string(),
        }),
        handler: async function (req, res, next) {
            const query = req.validatedQuery as { code: string; state: string; scope: string; };
            let api = new Twitch(Constants.TWITCH_CLIENT_ID, Constants.TWITCH_CLIENT_SECRET);
            let token: string;

            try {
                const result = await api.authorize({
                    code: query.code,
                    state: query.state,
                    redirect_uri: redirectUri,
                })

                token = result.access_token;
            } catch (_e) {
                const e: ApiError = _e;

                inspect("Error authorizing Twitch integration.", e);

                return next(e);
            }

            // TODO: Store the Twitch account in the database, then retrieve the account link request and redirect the user back to Alexa

            // Refresh the API with the user's access token
            api = new Twitch(Constants.TWITCH_CLIENT_ID, Constants.TWITCH_CLIENT_SECRET, token);

            try {
                const streams = await api.listFollowerStreams({});
                const response: string[] = [];

                if (streams._total === 0) {
                    response.push(`None of the channels you follow are streaming right now.`);
                } else {
                    if (streams._total > 1) {
                        response.push(`${streams._total} streamers you follow are streaming right now.`);
                    }

                    streams.streams.forEach(stream => {
                        response.push(`${stream.channel.display_name} is streaming ${stream.channel.status}`);
                    })
                }

                res.json({ response: response.join(". ") });
            } catch (_e) {
                const e: ApiError = _e;

                inspect("Error retrieving followed streams", e);

                return next(e);
            }

            return next();
        }
    })
}