import * as Bluebird from 'bluebird';
import * as Constants from '../modules/constants';
import * as fs from 'fs';
import * as Twitter from 'twitter';
import * as util from 'util';
import { Context } from 'azure-functions';
import { getTweets } from './tweets';
import { sendRollup } from './email';

function envRequired(key: string) {
    const value = process.env[key];

    if (value === undefined || value === null) {
        throw new Error(`Required env variable ${key} was null or undefined.`)
    }

    return value;
}

export = async (context: Context, timer) => {
    if (timer.isPastDue) {
        context.log('Twitter Rollup is running late!');
    } else {
        context.log('Twitter Rollup is running.');
    }

    const fileLocation = "./tweet-history.json";
    const sender = envRequired("TWITTER_ROLLUP_SENDER");
    const recipient = envRequired("TWITTER_ROLLUP_RECIPIENT");
    const sparkpostApiKey = envRequired("TWITTER_ROLLUP_SPARKPOST_API_KEY");
    const usernames = [
        "jessecox",
        "crendor",
        "jkcompletesit",
        "facianea",
        "akamikeb",
        "explainxkcd",
        "csallen",
        "patio11",
        "wesbos",
        "mpjme",
        "thelarkinn",
        "ken_wheeler",
        "davidfowl",
        "damianedwards",
        "terrajobst",
        "nolanlawson",
        "JenMsft",
        "oss_csharp",
        "oss_fsharp",
        "oss_js",
    ];
    let history: { [username: string]: { "lastTweetId": number } };

    if (fs.existsSync(fileLocation)) {
        history = JSON.parse(fs.readFileSync(fileLocation).toString());
    } else {
        history = {};
    }

    const tweets = await Bluebird.reduce<string, { [username: string]: Twitter.Tweet[] }>(usernames, async (result, username) => {
        const userHistory = history[username];
        const tweets = await getTweets(context, username, userHistory && userHistory.lastTweetId);

        if (tweets.length > 0) {
            // TODO: Filter out unwanted keywords like "I'm drinking an X" or "I just earned the Y badge"
            result[username] = tweets;
            history[username] = { lastTweetId: tweets[tweets.length - 1].id };
        }

        return result;
    }, {});

    try {
        const send = await sendRollup(sender, recipient, tweets, sparkpostApiKey);
    } catch (e) {
        context.log("Error sending Twitter Rollup email:", e);
    }

    // Write updated history back to the history file.
    fs.writeFileSync(fileLocation, JSON.stringify(history));
};