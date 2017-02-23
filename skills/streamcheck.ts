import inspect from "logspect";
import { Twitch } from "../modules/api";
import * as Db from "../modules/database";
import * as Constants from "../modules/constants";

export default async function configure(alexa) {
    alexa.intent("summaryIntent", {}, function (request, response) {
        (async function () {
            // The accessToken is the CouchDB doc's id, use it to grab the user's twitch token.
            const accessToken = request.sessionDetails.accessToken;
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
                        responses.push(`${streams._total} streamers you follow are streaming right now.`);
                    }

                    streams.streams.forEach(stream => {
                        responses.push(`${stream.channel.display_name} is streaming ${stream.channel.status}`);
                    })
                }

                response.say(responses.join(". "));
            } catch (_e) {
                inspect("Error retrieving followed streams", _e);

                response.say(`There was an error retrieving your followed streams. Sorry about that.`);
            }

            response.send();
        } ());

        // alexa-app package requires async functions to return false.
        return false;
    });
}