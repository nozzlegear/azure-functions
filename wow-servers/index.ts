import * as Constants from '../modules/constants';
import { ApiError, Blizzard } from '../modules/api';
import { Context, Request } from 'azure-functions';
import { RealmStatuses } from 'blizzard';
import alexa = require("alexa-message-builder");

export = async (context: Context, req: Request) => {
    context.log('JavaScript HTTP trigger function processed a request.');

    const api = new Blizzard(Constants.BLIZZARD_SECRET_KEY);
    const alexaRequest = (req.body || {}).request;
    const alexaSession = (req.body || {}).session;

    if (!alexaRequest || !alexaRequest.intent) {
        context.res = {
            body: "Invalid Alexa request. Body did not contain a .request or .intent value."
        }

        return context.done();
    }

    const message = new alexa();
    const optionRegex = /[^\w]$/i;
    const serverNameSlot = alexaRequest.intent.slots.serverName;

    if (!serverNameSlot || !serverNameSlot.value) {
        context.res = {
            body: "Sorry, I didn't understand which server you're asking about. Try asking me about the status of Zul'jin."
        }

        return context.done();
    }

    // Replace erroneous puncuation in variable
    const serverName = serverNameSlot.value.replace(/[^\w]$/i, "").replace(/ /i, "-");

    context.log("ServerName", serverName);

    let result: RealmStatuses;

    try {
        result = await api.listRealmStatuses(serverName);
    } catch (_e) {
        const e: ApiError = _e;

        context.log("Error fetching realm status:", e);

        context.res = {
            body: message.addText("There was an error fetching realm statuses. Please try again later.").get()
        }

        return context.done();
    }

    const body = result.data;
    const realm = result.data.realms.find(r => r.slug === serverName);

    if (!realm) {
        context.res = {
            body: message.addText("Sorry, I couldn't find the server " + serverName).get()
        }
    } else {
        const lines = [
            "You asked for server " + realm.name + ", which is a " + realm.population + " population " + realm.type + " server",
            realm.queue ? "There is currently a queue to get in" : "There is currently no queue to get in",

        ]

        context.res = {
            body: message.addText(lines.join(". ")).get()
        }
    }

    context.done();
};