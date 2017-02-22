declare module "app" {
    import { CouchDoc } from "davenport";
    export interface AccountLinkRequest extends CouchDoc {
        state: string;
        redirect_uri: string;
    }

    export interface TwitchAuth extends CouchDoc {
        twitch_token: string;
    }
}