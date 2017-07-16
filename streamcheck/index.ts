import * as Constants from '../modules/constants';
import * as Db from '../modules/database';
import * as joiful from 'gearworks-validation';
import * as qs from 'qs';
import * as ReactServer from 'react-dom/server';
import PrivacyPolicy from './pages/privacy-policy';
import StreamcheckPage from './pages/streamcheck-index';
import { ApiError, Twitch } from '../modules/api';
import { Context, Request } from 'azure-functions';
import { Respond } from '../modules/respond';
import alexa = require("alexa-message-builder");

interface OAuthQueryString {
    state: string;
    client_id: "streamcheck-alexa-skill";
    response_type: "token";
    scope?: string;
    redirect_uri: string;
}

interface AuthorizeQuery {
    code: string;
    state: string;
    scope: string;
}

export = async (context: Context, req: Request) => {
    context.log('JavaScript HTTP trigger function processed a request.');

    const redirectUri = "https://alexa.nozzlegear.com/twitch/authorize";

    // .path is specified in the function.json's bindings[0].route prop
    const bindingPath = context.bindingData.path;
    const reqPath = req.params.path;
    const response = Respond(context);

    context.log("Paths are", { reqPath, bindingPath });

    // Parse the path
    if (reqPath === "/streamcheck/privacy-policy") {
        const pageHtml = ReactServer.renderToStaticMarkup(PrivacyPolicy({}));

        return response
            .setContentType('text/html; charset=utf-8')
            .setBody(`<!DOCTYPE html> ${pageHtml}`)
            .send();
    }

    if (reqPath === "/streamcheck/oauth2/authorize") {
        const queryValidation = joiful.object<OAuthQueryString>({
            state: joiful.string().required(),
            client_id: joiful.string().only("streamcheck-alexa-skill").required(),
            response_type: joiful.string().only("token").required(),
            scope: joiful.stringOrEmpty(),
            redirect_uri: joiful.onlyStrings(
                "https://layla.amazon.com/spa/skill/account-linking-status.html?vendorId=M2DEEI35HP2KJ5",
                "https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=M2DEEI35HP2KJ5"
            ).required(),
        });
        const validation = joiful.validate<OAuthQueryString>(req.query, queryValidation);

        if (validation.error) {
            return response.setBody(validation.error.message).setStatus(422).send();
        }

        // Store the state and redirect_uri somewhere and give it an id that then gets passed as the state to the Twitch oauth URL.
        const query = validation.value;
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
        const pageHtml = ReactServer.renderToStaticMarkup(StreamcheckPage({ target_url: twitchAuthUrl }));

        return response.setContentType('text/html; charset=utf-8')
            .setBody(`<!DOCTYPE html> ${pageHtml}`)
            .send();
    }

    if (reqPath === "/twitch/authorize") {
        const queryValidation = joiful.object<AuthorizeQuery>({
            code: joiful.string().required(),
            state: joiful.string().required(),
            scope: joiful.stringOrEmpty(),
        })
        const validation = joiful.validate<AuthorizeQuery>(req.query, queryValidation);

        if (validation.error) {
            return response.setStatus(422).setBody(validation.error.message).send();
        }

        const api = new Twitch(Constants.TWITCH_CLIENT_ID, Constants.TWITCH_CLIENT_SECRET);
        let token: string;

        try {
            const result = await api.authorize({
                code: req.query.code,
                state: req.query.state,
                redirect_uri: redirectUri,
            })

            token = result.access_token;
        } catch (_e) {
            const e: ApiError = _e;

            context.log.error("Error authorizing Twitch integration.", e);

            return response.setStatus(502).setBody(e.message).send();
        }

        // Store the Twitch account token in the database
        const storeResult = await Db.TwitchAuthDb.post({ twitch_token: token });

        // Pull the account link request from the database, which we can look up using the state id
        const linkRequest = await Db.AccountLinkDb.get(req.query.state);

        // Your service redirects the user to the specified redirect_uri and passes along the state, access_token, and token_type in the URL fragment.
        const uri = `${linkRequest.redirect_uri}#state=${linkRequest.state}&access_token=${storeResult.id}&token_type=Bearer`;

        // Redirect the user back to Alexa
        return response.setRedirect(uri).send();
    }

    // Request is attempting to run the skill itself.
    const message = new alexa();

    // The accessToken is the CouchDB doc's id, use it to grab the user's twitch token.
    const accessToken = req.body.sessionDetails.accessToken;
    const user = await Db.TwitchAuthDb.get(accessToken);

    // Refresh the API with the user's access token
    const api = new Twitch(Constants.TWITCH_CLIENT_ID, Constants.TWITCH_CLIENT_SECRET, user.twitch_token);

    try {
        const streams = await api.listFollowerStreams({});
        const responses: string[] = [];

        if (streams._total === 0) {
            responses.push(`None of the channels you follow are streaming right now.`);
        } else {
            if (streams._total > 1) {
                responses.push(`${streams._total} streamers you follow are streaming right now`);
            }

            streams.streams.forEach(stream => {
                responses.push(`${stream.channel.display_name} is streaming ${stream.channel.status}`);
            })
        }

        message.addText(responses.join(". "));
    } catch (_e) {
        context.log.error("Error retrieving followed streams", _e);
        message.addText(`There was an error retrieving your followed streams. Sorry about that.`);

        // bad gateway
        response.setStatus(502);
    }

    return response.setBody(message.get()).send();
};