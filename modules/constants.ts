import inspect from 'logspect';
import { snakeCase } from 'lodash';

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

export const STAGES_API_KEY = get("STAGES_API_KEY");

export const TWITCH_CLIENT_ID = get("TWITCH_CLIENT_ID");

export const TWITCH_CLIENT_SECRET = get("TWITCH_CLIENT_SECRET");

export const GUMROAD_TOKEN = get("GUMROAD_ACCESS_TOKEN");

export const BLIZZARD_SECRET_KEY = get("BLIZZARD_SECRET_KEY");

export const ISLIVE = env.NODE_ENV === "production";