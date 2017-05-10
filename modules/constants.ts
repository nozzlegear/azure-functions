import inspect from "logspect";
import { resolve } from "path";
import { snakeCase } from "lodash";
import { v4 as guid } from "node-uuid";

const env = process && process.env || {};

export const APP_NAME = "Alexa";

function get(baseKey: string, defaultValue = undefined) {
    const snakedAppName = snakeCase(APP_NAME).toUpperCase();
    const snakedKey = snakeCase(baseKey).toUpperCase();

    return env[`${snakedAppName}_${snakedKey}`] || env[`GEARWORKS_${snakedKey}`] || env[snakedKey] || defaultValue;
}

export const COUCHDB_URL = get("COUCHDB_URL", "http://localhost:5984");

export const COUCHDB_USERNAME = get("COUCHDB_USERNAME");

export const COUCHDB_PASSWORD = get("COUCHDB_PASSWORD");

export const IRON_PASSWORD = get("IRON_PASSWORD");

export const JWT_SECRET_KEY = get("JWT_SECRET_KEY");

export const STAGES_API_KEY = get("STAGES_API_KEY");

export const KMSIGNALR_API_KEY = get("KMSIGNALR_API_KEY");

export const TWITCH_CLIENT_ID = get("TWITCH_CLIENT_ID");

export const TWITCH_CLIENT_SECRET = get("TWITCH_CLIENT_SECRET");

export const GUMROAD_TOKEN = get("GUMROAD_ACCESS_TOKEN");

export const USE_LEX = get("USE_LEX");

export const ISLIVE = env.NODE_ENV === "production";

if (!IRON_PASSWORD) {
    inspect("Warning: IRON_PASSWORD was not found in environment variables. Session authorization will be unsecure and may exhibit unwanted behavior.");
}