import { Context, Request, Response as FunctionResponse } from 'azure-functions';
import { Respond } from '../modules/respond';
import alexa = require("alexa-message-builder");

export = async (context: Context, req: Request): Promise<FunctionResponse> => {
    context.log('JavaScript HTTP trigger function processed a request.');

    const response = Respond(context);
    const body = req.body || {};
    const query = req.query || {};
    const alexaRequest = body.request;
    const alexaSession = body.session;

    if (!alexaRequest || !alexaRequest.intent) {
        return response.setBody(`Invalid Alexa request. Body did not contain a .request or .intent value.`).send();
    }

    const message = new alexa();
    const optionRegex = /[^\w]$/i;
    const intent = alexaRequest.intent;
    const items = Object.keys(intent.slots).reduce((items, slotName, self) => {
        const item = intent.slots[slotName];

        if (item.value) {
            item.value = item.value.replace(optionRegex, "");

            items.push(item)
        }

        return items;
    }, [])
    const chosen = items[Math.floor(Math.random() * items.length)];
    const text = [
        "If the options are ",
    ];

    items.forEach((item, index, self) => {
        if (index === self.length - 1) {
            text.push("and " + item.value);
        } else {
            text.push(item.value);
        }

        text.push(", ");
    });

    text.push("I would choose " + chosen.value + ".");

    context.res = {
        body: message.addText(text.join("")).get()
    }

    context.done();
};