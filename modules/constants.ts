import inspect from "logspect";
import { resolve } from "path";
import { snakeCase } from "lodash";
import isBrowser from "is-in-browser";
import { v4 as guid } from "node-uuid";

// NODE_ENV is injected by webpack for the browser client.
declare const NODE_ENV: string;

const env = process && process.env || {};

export const APP_NAME = "Gearworks";

function get(baseKey: string, defaultValue = undefined) {
    const snakedAppName = snakeCase(APP_NAME).toUpperCase();
    const snakedKey = snakeCase(baseKey).toUpperCase();

    return env[`${snakedAppName}_${snakedKey}`] || env[`GEARWORKS_${snakedKey}`] || env[snakedKey] || defaultValue;
}

export const COUCHDB_URL = get("COUCHDB_URL", "http://localhost:5984");

export const IRON_PASSWORD = get("IRON_PASSWORD");

export const ISLIVE = env.NODE_ENV === "production" || (isBrowser && NODE_ENV === "production");

export const AUTH_HEADER_NAME = "x-gearworks-token";

if (!isBrowser) {
    if (!IRON_PASSWORD) {
        inspect("Warning: IRON_PASSWORD was not found in environment variables. Session authorization will be unsecure and may exhibit unwanted behavior.");
    }
}