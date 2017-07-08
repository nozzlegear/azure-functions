import { Context, Request } from 'azure-functions';
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

    function respond(text, status?: number) {
        const message = new alexa();
        status = typeof (status) === "number" ? status : 200;

        context.res = {
            body: message.addText(text).get()
        }

        return context.done();
    }

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


    return respond(`You've sold ${count} products since ${date.forSpeech}, for a total of $${value} before fees and taxes.`);
};