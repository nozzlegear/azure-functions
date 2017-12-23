import * as Bluebird from 'bluebird';
import * as Twitter from 'twitter';

export function getTweets(client: Twitter, username: string, sinceId: number = 1) {
    return new Bluebird<Twitter.Tweet[]>((res, rej) => {
        // TODO: Allow replies, but only to the list of users that we're following.
        client.get("statuses/user_timeline", { screen_name: username, since_id: sinceId, exclude_replies: true, tweet_mode: "extended" }, (err, tweets, resp) => {
            if (err) {
                console.error(`Error getting tweets for ${username}.`, { error: err, resp: resp });
            }

            const filteredTweets =
                (tweets || [])
                    // When using since_id, Twitter will return anything >= the id, but we only want anything > id.
                    .filter(tweet => tweet.id > sinceId)
                    // Sort from oldest to newest (smallest id to biggest)
                    .sort((a, b) => a.id - b.id);

            // Don't break the app, just return 0 tweets.
            res(filteredTweets);
        })
    })
}