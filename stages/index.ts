import { Context, Request } from 'azure-functions';
import { Stages } from '../modules/api';
import { STAGES_API_KEY } from '../modules/constants';
import alexa = require("alexa-message-builder");

export = async (context: Context, req: Request) => {
    context.log('JavaScript HTTP trigger function processed a request.');

    const api = new Stages(STAGES_API_KEY);
    const summary = await api.getSummary("subscribed");
    const message = new alexa();

    context.res = {
        status: 200,
        body: message.addText(`Stages has ${summary.totalActiveSubscribers} subscribers, for a total of $${summary.totalMonthlyValue.toFixed(2)} per month.`).get()
    }

    return context.done();
};