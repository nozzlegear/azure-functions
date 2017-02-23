import inspect from "logspect";
import { Twitch } from "../modules/api";
import * as Constants from "../modules/constants";

export default async function configure(alexa) {
    alexa.intent("summaryIntent", {}, function (request, response) {
        inspect("Alexa request received", request);

        (async function () {
            response.say("Hello world! This is the Streamcheck intent.");

            // Refresh the API with the user's access token
            // const api = new Twitch(Constants.TWITCH_CLIENT_ID, Constants.TWITCH_CLIENT_SECRET, token);

            // try {
            //     const streams = await api.listFollowerStreams({});
            //     const response: string[] = [];

            //     if (streams._total === 0) {
            //         response.push(`None of the channels you follow are streaming right now.`);
            //     } else {
            //         if (streams._total > 1) {
            //             response.push(`${streams._total} streamers you follow are streaming right now.`);
            //         }

            //         streams.streams.forEach(stream => {
            //             response.push(`${stream.channel.display_name} is streaming ${stream.channel.status}`);
            //         })
            //     }

            //     res.json({ response: response.join(". ") });
            // } catch (_e) {
            //     const e: ApiError = _e;

            //     inspect("Error retrieving followed streams", e);

            //     return next(e);
            // }

            response.send();
        } ());

        // alexa-app package requires async functions to return false.
        return false;
    });
}