import { Context, Request } from 'azure-functions';
import { Respond } from '../modules/respond';
import alexa = require("alexa-message-builder");

function formatDateForSpeech(date) {
    return date.toLocaleDateString("en-US", {
        year: undefined,
        month: "long",
        weekday: "long",
        day: "2-digit"
    })
}

function startOfWeek() {
    const t = new Date();
    t.setDate(t.getDate() - t.getDay());

    return {
        date: t,
        // Outputs date in yyyyMMDD
        forApi: t.toISOString().split("T")[0],
        forSpeech: formatDateForSpeech(t)
    }
}

function startOfMonth() {
    const t = new Date(new Date().setDate(1));

    return {
        date: t,
        // Outputs date in yyyyMMDD
        forApi: t.toISOString().split("T")[0],
        forSpeech: formatDateForSpeech(t)
    }
}

export = async (context: Context, req: Request) => {
    context.log('JavaScript HTTP trigger function processed a request.');

    const response = Respond(context);
    const query = req.query || {};
    const body = req.body || {};
    const intent = body.request.intent;
    let count = 0;
    let value = 0;
    let date;

    switch (intent.name) {
        case "weeklySummary":
            count = 5;
            value = 5 * 39;
            date = startOfWeek()
            break;

        default:
        case "monthlySummary":
            count = 10;
            value = 10 * 39;
            date = startOfMonth()
            break;
    }

    // // Old skill below
    // const api = new Gumroad({
    //     token: GUMROAD_TOKEN
    // });
    // const lastFriday = getLastFriday();
    // const sales = await api.listSales(lastFriday.yyyyMmDd, null, 1);
    // const gumroadFeeRate = 0.0564;

    // if (! sales.success) {
    //     response.say(`There was an error with Gumroad's response.`, sales);
    // } else {
    //     const subtotal = sales.sales.reduce((total, sale, index) => total += sale.price , 0) / 100;
    //     const total = subtotal - (subtotal * gumroadFeeRate);

    //     response.say(`You've sold ${sales.sales.length} books on Gumroad since Friday, for a payout of $${total.toFixed(2)} after fees.`);
    // }

    // response.send();


    return response
        .setBody(`You've sold ${count} products since ${date.forSpeech}, for a total of $${value} before fees and taxes.`)
        .send();
};