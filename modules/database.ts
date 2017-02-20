import { COUCHDB_URL } from "./constants";
import { Client, configureDatabase } from "davenport";

const dbName = "alexa_twitch_oauth";

export default async function configureAll() {
    await configureDatabase(COUCHDB_URL, {
        name: dbName,
    })
}

export const TwitchAuthDb = new Client<any>(COUCHDB_URL, dbName, { warnings: false });