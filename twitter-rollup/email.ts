import * as Bluebird from 'bluebird';
import * as Twitter from 'twitter';
import { createTransport } from 'nodemailer';

export type UserTweets = { [username: string]: Twitter.Tweet[] }

export function prepareTweetHtml(tweet: Twitter.Tweet) {
    const strings: string[] = [];
    const username = tweet.user.name;
    const isRetweet = !!tweet.retweeted_status;
    const urls = (isRetweet ? tweet.retweeted_status.entities.urls : tweet.entities.urls) || [];
    const media = (isRetweet ? tweet.retweeted_status.entities.media : tweet.entities.media) || [];
    const mentions = (isRetweet ? tweet.retweeted_status.entities.user_mentions : tweet.entities.user_mentions) || [];
    let text = isRetweet ? tweet.retweeted_status.full_text : tweet.full_text;

    text = mentions.reduce((text, mention, index, array) => {
        const indices = mention.indices;
        const wrapperStart = `<a href='https://mobile.twitter.com/${mention.screen_name}'>`;
        const mentionText = text.substring(indices[0], indices[1]);
        const wrapperEnd = `</a>`;

        text = text.substring(0, indices[0]) + (wrapperStart + mentionText + wrapperEnd) + text.substring(indices[1]);

        // All following index's should be `value + wrapperStart.length + wrapperEnd.length`;
        for (let i = index + 1; i < array.length; i++) {
            const nextIndex = array[i].indices;

            nextIndex[0] = nextIndex[0] + wrapperStart.length + wrapperEnd.length;
            nextIndex[1] = nextIndex[1] + wrapperStart.length + wrapperEnd.length;
        }

        return text;
    }, text);
    text = urls.reduce((text, url) => text = text.replace(url.url, tweet.is_quote_status && url.expanded_url.indexOf(tweet.quoted_status_id_str) > -1 ? "" : `<a href='${url.url}'>${url.expanded_url}</a>`), text);
    text = media.reduce((text, media) => media.type === "photo" ? text.replace(media.url, "") : text, text);

    strings.push("<p style='margin: 0'>");
    strings.push(`<a href='https://mobile.twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}'>(Link)</a>`);

    if (isRetweet) {
        strings.push(`<strong>${username}</strong> retweeted <strong><a href='https://mobile.twitter.com/${tweet.retweeted_status.user.screen_name}'>@${tweet.retweeted_status.user.screen_name}</a></strong>:`)
    } else if (tweet.is_quote_status && tweet.quoted_status) {
        strings.push(`<strong>${username}</strong> quoted <strong><a href='https://mobile.twitter.com/${tweet.quoted_status.user.screen_name}'>@${tweet.quoted_status.user.screen_name}</a></strong>:`);
        text = text + `<blockquote>"${tweet.quoted_status.full_text}"</blockquote>`;
    } else {
        strings.push(`<strong>${username}</strong>:`)
    }

    strings.push("</p>");
    strings.push("<p style='margin:0; margin-top:10px;'>")
    strings.push(text.replace(/\n/ig, "<br/>"));
    strings.push("</p>");

    media.forEach(media => {
        if (media.type === "photo") {
            strings.push(`<div style='padding-top: 10px'><a href='${media.url}'><img src='${media.media_url_https}' style='max-width: 100%; max-height:400px' /></a></div>`)
        }
    })

    return `<div style='padding: 10px 0; border-bottom: 1px solid #ccc;'>${strings.join(" ")}</div>`;
}

export function sendRollup(sender: string, recipient: string, tweets: UserTweets, sparkpostKey: string) {
    const html = "<h1>Daily Twitter Roundup</h1><p>Sorted by user, oldest to newest.</p>" + Object.getOwnPropertyNames(tweets).reduce((html, username) => {
        const userTweets = tweets[username];

        if (userTweets.length === 0) {
            return html + `<div>No tweets for @${username}. Was there a problem with the program?</div>`;
        }

        return html + userTweets.map(prepareTweetHtml).join("\n");
    }, "");

    return new Bluebird((res, rej) => {
        const message = {
            content: {
                from: {
                    name: "Twitter Rollup",
                    email: sender,
                },
                subject: `Twitter rollup for ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}.`,
                html: html,
            },
            recipients: [{
                address: {
                    email: recipient,
                }
            }]
        }

        //Send the roundup email
        const transporter = createTransport({ transport: 'sparkpost', sparkPostApiKey: sparkpostKey } as any);

        transporter.sendMail(message as any, (error, info) => {
            if (error) {
                rej(error);

                return;
            }

            res(info);
        });
    })
}