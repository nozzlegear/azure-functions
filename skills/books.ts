import inspect from "logspect";
import { Express } from "express";
import * as Alexa from "alexa-app";
import * as Gumroad from "gumroad-api";
import { GUMROAD_TOKEN } from "../modules/constants";
import { getLastFriday } from "../modules/dates";

export default async function configure(alexa) {
    const api = new Gumroad({
        token: GUMROAD_TOKEN
    });

    alexa.intent("booksIntent", {}, function (request, response) {
        (async function () {
            const lastFriday = getLastFriday();
            const sales = await api.listSales(lastFriday.yyyyMmDd, null, 1);
            const gumroadFeeRate = 0.0564;
            const total = sales.reduce((total, sale, index) => total += sale.price , 0) * gumroadFeeRate;

            response.say(`You've sold ${sales.length} books on Gumroad since Friday, for a payout of $${total.toFixed(2)} after fees.`);
            response.send();
        } ());

        // alexa-app package requires async functions to return false.
        return false;
    });
}