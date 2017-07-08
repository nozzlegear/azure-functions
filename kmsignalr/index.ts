import inspect from 'logspect';
import { Context, Request } from 'azure-functions';
import { KMSignalR } from '../modules/api';
import { KMSIGNALR_API_KEY } from '../modules/constants';
import Alexa = require("alexa-message-builder");

const api = new KMSignalR(KMSIGNALR_API_KEY);

export = async (context: Context, req: Request) => {
    context.log('Running the KMSignalR intent.');

    const result = await api.getSummary();
    const onHold = result.summaries.find(d => d.for_status === "on_hold");
    const unshipped = result.summaries.find(d => d.for_status === "total_unshipped");
    const message = new Alexa();

    if (unshipped.current_count === 0) {
        message.addText(`Merricks had a total of ${result.total_orders} portraits today, with ${onHold.current_count} on hold for tomorrow.`);
    } else {
        message.addText(`Merricks currently has a total of ${result.total_orders} portraits, with ${unshipped.current_count} left to ship.`);
    }

    context.res = {
        status: 200,
        body: message.get()
    }

    return context.done();
};