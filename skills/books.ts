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
            try {
                const lastFriday = getLastFriday();
                const sales = await api.listSales(lastFriday.yyyyMmDd, null, 1);
                const gumroadFeeRate = 0.0564;

                if (! sales.success) {
                    response.say(`There was an error with Gumroad's response.`, sales);
                } else {
                    const subtotal = sales.sales.reduce((total, sale, index) => total += sale.price , 0) / 100;
                    const total = subtotal - (subtotal * gumroadFeeRate);

                    response.say(`You've sold ${sales.sales.length} books on Gumroad since Friday, for a payout of $${total.toFixed(2)} after fees.`);
                }

                response.send();
            } catch (e) {
                inspect("Error with Blackbox's book skill:", e);

                response.say("There was an error with Blackbox's book skill.");
                response.send();
            }
        } ());

        // alexa-app package requires async functions to return false.
        return false;
    });
}