import { Express } from "express";
import * as Alexa from "alexa-app";
import StagesSkill from "./stages";
import KMSignalRSkill from "./kmsignalr";

export default async function configure(server: Express) {
    const app = new Alexa.app("rasputin");

    [StagesSkill, KMSignalRSkill].forEach(async skill => await skill(app));

    app.express(server, "/skills/");
}