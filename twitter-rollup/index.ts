import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import * as path from 'path';
import * as Twitter from 'twitter';
import * as util from 'util';
import { existsSync, readSync } from 'fs';
import { getTweets } from './tweets';
import { sendRollup } from './email';
import getStdin = require("get-stdin");

function envRequired(key: string) {
    const value = process.env[key];

    if (value === undefined || value === null) {
        throw new Error(`Required env variable ${key} was null or undefined.`)
    }

    return value;
}

async function run(bodyContent: string) {
    const fileLocation = path.join(__dirname, "tweet-history.json");
    const client = new Twitter({
        consumer_key: envRequired("TWITTER_CONSUMER_KEY"),
        consumer_secret: envRequired("TWITTER_CONSUMER_SECRET"),
        bearer_token: envRequired("TWITTER_BEARER_TOKEN"),
    })
    const sender = envRequired("TWITTER_ROLLUP_SENDER");
    const recipient = envRequired("TWITTER_ROLLUP_RECIPIENT");
    const swuKey = envRequired("TWITTER_ROLLUP_SWU_KEY");
    const swuTemplateId = envRequired("TWITTER_ROLLUP_SWU_TEMPLATE");
    const follows = envRequired("TWITTER_ROLLUP_FOLLOWS").split(",").filter(username => !!username).map(username => username.trim())
    let history: { [username: string]: { "lastTweetId": number } };

    if (fs.existsSync(fileLocation)) {
        history = JSON.parse(fs.readFileSync(fileLocation).toString());
    } else {
        history = {};
    }

    let totalTweets = 0;

    const tweets = await Bluebird.reduce<string, { [username: string]: Twitter.Tweet[] }>(follows, async (result, username) => {
        const userHistory = history[username];
        let tweets: Twitter.Tweet[] = []

        try {
            tweets = await getTweets(client, username, userHistory && userHistory.lastTweetId);
        } catch (e) {
            console.error(`Error getting tweets for username ${username}.`, e)
        }

        if (tweets.length > 15) {
            // Emails have a hard limit of 128kb, so trim some tweets to ensure we don't hit it.
            tweets = tweets.slice(0, 15);
        }

        if (tweets.length > 0) {
            totalTweets += tweets.length
            // TODO: Filter out unwanted keywords like "I'm drinking an X" or "I just earned the Y badge"
            result[username] = tweets;
            // The last tweet id should be the greatest one.
            history[username] = { lastTweetId: tweets.reduce((lastId, tweet) => tweet.id > lastId ? tweet.id : lastId, 0) };
        }

        return result;
    }, {});

    try {
        const send = await sendRollup(tweets, {
            recipient,
            sender,
            sendWithUsKey: swuKey,
            sendWithUsTemplateId: swuTemplateId
        });
    } catch (_e) {
        const e: Error = _e;
        e.message = "Error sending Twitter Rollup email: " + e.message;

        throw e;
    }

    console.log(JSON.stringify({ status: 200, message: "Sent email." }));

    // Write updated history back to the history file.
    fs.writeFileSync(fileLocation, JSON.stringify(history));
}

// When running an OpenFaaS function, request body is passed to stdin and request headers/querystring are available as environment variables.
getStdin()
    .then(run)
    .catch(console.error);