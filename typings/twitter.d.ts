declare module "twitter" {

    namespace Twitter {
        export interface UserAuthentication {
            consumer_key: string;
            consumer_secret: string;
            access_token_key: string;
            access_token_secret: string;
        }

        export interface AppAuthentication {
            consumer_key: string;
            consumer_secret: string;
            bearer_token: string;
        }

        export interface User {
            id: number;
            name: string;
            screen_name: string;
            location: string;
            description: string;
            url: string;
        }

        export interface Size {
            w: number;
            h: number;
            resize: "fit" | "crop";
        }

        export interface Media {
            id: number;
            id_str: string;
            indices: number[];
            media_url: string;
            media_url_https: string;
            url: string;
            display_url: string;
            expanded_url: string;
            type: "photo";
            sizes: {
                large: Size;
                medium: Size;
                thumb: Size;
                small: Size;
            }
            source_status_id: number;
            source_status_id_str: string;
            source_user_id: number;
            source_user_id_str: string;
        }

        export interface Url {
            url: string;
            expanded_url: string;
            display_url: string;
            indices: number[];
        }

        export interface UserMention {
            screen_name: string;
            name: string;
            id: number;
            id_str: string;
            indices: number[];
        }

        export interface Tweet {
            id: number;
            id_str: string;
            full_text: string;
            is_quote_status: boolean;
            retweeted_status?: Tweet;
            quoted_status?: Tweet;
            quoted_status_id?: number;
            quoted_status_id_str: string;
            entities: {
                hashtags: any[],
                symbols: any[],
                user_mentions: UserMention[],
                urls: Url[],
                media?: Media[],
            }
            user: User;
        }
    }

    class Twitter {
        constructor(config: Twitter.UserAuthentication | Twitter.AppAuthentication);

        get(path: string, callback: (error, tweets: Twitter.Tweet[], response) => void);
        get(path: string, params: any, callback: (error, tweets: Twitter.Tweet[], response) => void);
        post(path: string, callback: (error, tweet: Twitter.Tweet, response) => void);
        post(path: string, params: any, callback: (error, tweet: Twitter.Tweet, response) => void);
        stream(path: string, callback: (stream: any) => void);
        stream(path: string, params: any, callback: (stream: any) => void);
    }

    export = Twitter;
}