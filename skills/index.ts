import { Express } from "express";
import * as Alexa from "alexa-app";
import StagesSkill from "./stages";
import KMSignalRSkill from "./kmsignalr";

export default async function configure(server: Express) {
    const auntieDot = new Alexa.app("auntie-dot");
    const restream = new Alexa.app("restream");

    [StagesSkill, KMSignalRSkill].forEach(async skill => await skill(auntieDot));

    auntieDot.express(server, "/skills/");
    restream.express(server, "/skills/");
}