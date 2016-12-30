import inspect from "logspect";
import { Express } from "express";
import * as Alexa from "alexa-app";
import { Stages } from "../modules/api";
import { STAGES_API_KEY } from "../modules/constants";

export default async function configure(alexa) {
    const api = new Stages(STAGES_API_KEY);

    alexa.intent("summaryIntent", {}, function (request, response) {
        (async function () {
            const summary = await api.getSummary("subscribed");

            response.say(`Stages has ${summary.totalActiveSubscribers} subscribers, for a total of $${summary.totalMonthlyValue.toFixed(2)} per month.`);
            response.send();
        } ());

        // alexa-app package requires async functions to return false.
        return false;
    });
}