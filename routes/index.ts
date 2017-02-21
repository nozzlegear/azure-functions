import * as qs from "qs";
import * as joi from "joi";
import inspect from "logspect";
import { Express } from "express";
import { v4 as guid } from "node-uuid";
import getRouter from "gearworks-route";
import { Twitch, ApiError } from "../modules/api";
import * as Constants from "../modules/constants";

export default async function configureRoutes(app: Express) {
    const route = getRouter<any>(app, {
        iron_password: Constants.IRON_PASSWORD,
        jwt_secret_key: Constants.JWT_SECRET_KEY,
        shopify_secret_key: "empty",
    });
    const redirectUri = "http://localhost:3000/twitch/authorize";

    route({
        label: "Amazon OAuth authorization page",
        method: "get",
        path: "/streamcheck/oauth2/authorize",
        handler: async function (req, res, next) {
            const validRedirectUris = [
                "https://layla.amazon.com/spa/skill/account-linking-status.html?vendorId=M2DEEI35HP2KJ5",
                "https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=M2DEEI35HP2KJ5"
            ];
            const expectedClientId = "streamcheck-alexa-skill";

            // Redirect the user to the twitch OAuth page
            const query = qs.stringify({
                response_type: "code",
                client_id: Constants.TWITCH_CLIENT_ID,
                scope: "user_read",
                state: guid(),
                force_verify: true,
                redirect_uri: redirectUri,
            });
            const twitchAuthUrl = `https://api.twitch.tv/kraken/oauth2/authorize?${query}`;

            res.redirect(twitchAuthUrl);

            return next();
        }
    })

    route({
        label: "Redirect to Twitch OAUth page",
        method: "get",
        path: "/twitch/oauth",
        handler: async function (req, res, next) {
            const query = qs.stringify({
                response_type: "code",
                client_id: Constants.TWITCH_CLIENT_ID,
                scope: "user_read",
                state: guid(),
                force_verify: true,
                redirect_uri: redirectUri,
            });
            const twitchAuthUrl = `https://api.twitch.tv/kraken/oauth2/authorize?${query}`;

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