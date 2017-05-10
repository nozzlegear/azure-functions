import { Express } from "express";
import * as Alexa from "alexa-app";

// Skills
import BookSkill from "./books";
import StagesSkill from "./stages";
import KMSignalRSkill from "./kmsignalr";
import StreamcheckSkill from "./streamcheck";

export default async function configure(server: Express) {
    const blackbox = new Alexa.app("blackbox");
    const streamcheck = new Alexa.app("streamcheck");

    const blackboxSkills = await Promise.all([
        StagesSkill, 
        KMSignalRSkill,
        BookSkill,
    ].map(skill => skill(blackbox)));
    const streamcheckSkills = await StreamcheckSkill(streamcheck);

    blackbox.express(server, "/skills/");
    streamcheck.express(server, "/skills/");
}