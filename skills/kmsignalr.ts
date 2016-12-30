import inspect from "logspect";
import { KMSignalR } from "../modules/api";
import { KMSIGNALR_API_KEY } from "../modules/constants";

export default async function configure(alexa) {
    const api = new KMSignalR(KMSIGNALR_API_KEY);

    alexa.intent("kmsignalrIntent", {}, function (request, response) {
        (async function () {
            const apiResponse = await api.getSummary();
            const result = apiResponse.Result;
            const data = result.Data;
            const onHold = data.find(d => d.Label === "Held");
            const unshipped = data.find(d => d.Label === "Portraits Unshipped");

            if (unshipped.Count === 0) {
                response.say(`Merricks had a total of ${result.Total} portraits today, with ${onHold.Count} on hold for tomorrow.`);
            } else {
                response.say(`Merricks currently has a total of ${result.Total} portraits, with ${unshipped.Count} left to ship.`);
            }

            response.send();
        } ());

        // alexa-app package requires async functions to return false.
        return false;
    });
}