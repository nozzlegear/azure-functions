import inspect from "logspect";
import { Express } from "express";
import * as Alexa from "alexa-app";

export default async function configure(server: Express) {
    const skill = new Alexa.app("rasputin");

    skill.intent("summaryIntent", {  }, function (request, response) {
        response.say("Rasputin is not yet ready to retrieve your financials.");
    });

    skill.express(server, "/skills/");
}