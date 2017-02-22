import { COUCHDB_URL } from "./constants";
import { TwitchAuth, AccountLinkRequest } from "app";
import { Client, configureDatabase } from "davenport";

const dbName = "alexa_twitch_oauth";
const accountLinkDbName = "alexa_account_link_requests";

export default async function configureAll() {
    await configureDatabase(COUCHDB_URL, {
        name: dbName,
    })
}

export const AccountLinkDb = new Client<AccountLinkRequest>(COUCHDB_URL, accountLinkDbName, { warnings: false });
export const TwitchAuthDb = new Client<TwitchAuth>(COUCHDB_URL, dbName, { warnings: false });