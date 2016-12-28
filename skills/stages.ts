import inspect from "logspect";
import { Express } from "express";
import * as Alexa from "alexa-app";

export default async function configure(server: Express) {
    const skill = new Alexa.app("stages");

    skill.launch(function (request, response) {
        response.say("You launched the Stages app!");
    });

    skill.dictionary = {
        names: ["matt", "joe", "bob", "bill", "mary", "jane", "dawn"]
    };

    skill.intent("summaryIntent", {
        "slots": { "NAME": "LITERAL" },
        "utterances": [
            "my {name is|name's} {names|NAME}", "set my name to {names|NAME}"
        ]
    }, function (request, response) {
        inspect(request);

        response.say("Success!");
    });

    skill.express(server, "/echo/");
}