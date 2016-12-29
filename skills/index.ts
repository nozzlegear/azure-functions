import inspect from "logspect";
import { Express } from "express";
import * as Alexa from "alexa-app";
import { Stages } from "../modules/api";
import { STAGES_API_KEY } from "../modules/constants";

export default async function configure(server: Express) {
    const skill = new Alexa.app("rasputin");
    const api = new Stages(STAGES_API_KEY);

    skill.intent("summaryIntent", {}, function (request, response) {
        (async function () {
            const summary = await api.getSummary("subscribed");

            response.say(`Stages has ${summary.totalActiveSubscribers} subscribers, for a total of $${summary.totalMonthlyValue.toFixed(2)} per month.`);
            response.send();
        } ());

        // alexa-app package requires async functions to return false.
        return false;
    });

    skill.express(server, "/skills/");
}