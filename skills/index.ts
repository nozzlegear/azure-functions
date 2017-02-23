import { Express } from "express";
import * as Alexa from "alexa-app";

// Skills
import StagesSkill from "./stages";
import KMSignalRSkill from "./kmsignalr";
import StreamcheckSkill from "./streamcheck";

export default async function configure(server: Express) {
    const auntieDot = new Alexa.app("auntie-dot");
    const streamcheck = new Alexa.app("streamcheck");

    [StagesSkill, KMSignalRSkill].forEach(async skill => await skill(auntieDot));
    await StreamcheckSkill(streamcheck);

    auntieDot.express(server, "/skills/");
    streamcheck.express(server, "/skills/");
}