import { Context, Response as FunctionResponse } from 'azure-functions';
import alexaMessage = require("alexa-message-builder");

class Response {
    constructor(private context: Context) {

    }

    private _status: number = 200;

    private _headers: { [key: string]: any } = {};

    private _contentType: string = "application/json";

    private _body: any;

    private _redirect: { to: string; permanent: boolean };

    /**
     * Sets the response message's status code.
     */
    setStatus(this: Response, status: number): Response {
        this._status = status;

        return this;
    }

    /**
     * Sets the response message's Content-Type. This will override any Content-Type header that was set with .setHeader().
     */
    setContentType(this: Response, type: string): Response {
        this._contentType = type;

        return this;
    }

    /**
     * Adds the header to the response message. Will overwrite the header with the given key, if it exists.
     * @param key The header's key.
     * @param value The header's value.
     */
    setHeader(this: Response, key: string, value: any): Response {
        this._headers[key] = value;

        return this;
    }

    /**
     * Deletes the header from the response message. Will not delete the Content-Type header.
     */
    removeHeader(this: Response, key: string): Response {
        delete this._headers[key];

        return this;
    }

    /**
     * Sets the response body, stringifying the value if it's an object or array. Will throw an error if the value is null or undefined.
     */
    setBody(this: Response, value: string | object | alexaMessage): Response {
        if (value === null || value === undefined) {
            throw new Error(`Could not set response body: value was null or undefined.`);
        }

        if (value instanceof alexaMessage) {
            this._body = value.get();
        } else {
            this._body = value;
        }

        return this;
    }

    /**
     * Redirects the client to the given URL. Will not return the response body or Content-Type header, but will return other headers. Will throw an error if the url is null or empty.
     */
    setRedirect(to: string, permanent = false): Response {
        if (to === null || to === undefined) {
            throw new Error(`Could not set redirect URL: value was null or undefined.`);
        }

        this._redirect = { to, permanent };

        return this;
    }

    /**
     * Removes any redirect response that was set.
     */
    removeRedirect(): Response {
        this._redirect = undefined;

        return this;
    }

    /**
     * Finalizes the response and sends it to the recipient. Will not call context.done() by default. 
     * @param callDone Whether to call context.done() after sending the response. When running in an Azure function you should either return a promise *or* call context.done, not both.
     */
    send(this: Response, callDone = false): FunctionResponse {
        this.context.res = this._redirect && this._redirect.to ? {
            status: this._redirect.permanent ? 301 : 302,
            headers: { ...this._headers, "Location": this._redirect.to, "Content-Type": undefined },
            body: ""
        } : {
                status: this._status,
                body: this._body,
                headers: { ... this._headers, "Content-Type": this._contentType }
            }

        if (callDone) {
            this.context.done();
        }

        return this.context.res;
    }
}

/**
 * Creates a response message.
 */
export const Respond = (context: Context) => {
    return new Response(context);
}

export default Respond;