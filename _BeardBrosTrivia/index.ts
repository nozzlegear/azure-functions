import * as Constants from './constants';
import Respond from '../modules/respond';
import { Context, Request, Response as FunctionResponse } from 'azure-functions';
import alexa = require("alexa-message-builder");

function getRandomArrayValue<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
}

export = async (context: Context, req: Request): Promise<FunctionResponse> => {
    context.log('JavaScript HTTP trigger function processed a request.');

    const response = Respond(context);
    const query = req.query || {};
    const body = req.body || {};
    const quote = getRandomArrayValue(Constants.quotes);
    const quoteIntro = getRandomArrayValue([...Constants.quoteIntroSuffixes, ...Constants.quoteIntroPrefixes]);
    const introIsSuffix = Constants.quoteIntroSuffixes.indexOf(quoteIntro) > -1;
    let by = quote.by;
    let message: string;

    // Choose a fancy name 3/10 times
    if (Math.random() <= .3) {
        switch (quote.by.toLowerCase()) {
            case "alex":
                by = getRandomArrayValue(Constants.alexFancyNames);
                break;

            case "jirard":
                by = getRandomArrayValue(Constants.jirardFancyNames);
                break;
        }
    }

    if (introIsSuffix) {
        message = `${by} ${quoteIntro}`;
    } else {
        message = `${quoteIntro} ${by}`;
    }

    message += `. "${quote.quote}"`;

    // Replace "Jirard" with "Gerard" to get Alexa to pronounce it correctly
    message = message.replace(/jirard/ig, "Gerard");

    return response.setBody(new alexa().addText(message.trim())).send();
};