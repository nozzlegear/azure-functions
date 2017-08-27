import * as Bluebird from 'bluebird';
import * as Twitter from 'twitter';
import { Context } from 'azure-functions';

export function getTweets(context: Context, client: Twitter, username: string, sinceId: number = 1) {
    return new Bluebird<Twitter.Tweet[]>((res, rej) => {
        client.get("statuses/user_timeline", { screen_name: username, since_id: sinceId, exclude_replies: true, tweet_mode: "extended" }, (err, tweets, resp) => {
            if (err) {
                context.log(`Error getting tweets for ${username}.`, { error: err, resp: resp });
            }

            // When using since_id, Twitter will return anything >= the id. Skip the last seen tweet.
            const filteredTweets = (tweets || []).filter(tweet => tweet.id > sinceId);

            // Don't break the app, just return 0 tweets.
            res(filteredTweets);
        })
    })
}