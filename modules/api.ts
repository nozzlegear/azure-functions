import AxiosFactory, { AxiosResponse } from 'axios';
import inspect from 'logspect';
import { FollowsResponse, StreamsResponse } from 'twitch';
import { Plan, Subscriber, Summary } from 'stages';
import { RealmStatuses } from 'blizzard';
import { SummaryResult } from 'kmsignalr';

/**
 * Indicates whether the request was a success or not (between 200-300).
 */
export function isOkay(response: AxiosResponse) {
    return response.status >= 200 && response.status < 300;
}

export class ApiError extends Error {
    constructor(body?: string | Object, axiosResponse?: AxiosResponse) {
        super("Something went wrong and your request could not be completed.");

        if (!!axiosResponse) {
            this.unauthorized = axiosResponse.status === 401;
            this.status = axiosResponse.status;
            this.statusText = axiosResponse.statusText;
            this.url = axiosResponse.config.url;

            if (body) {
                try {
                    const response: { message: string, details: { key: string, errors: string[] }[] } = typeof (body) === "string" ? JSON.parse(body || "{}") : body;

                    this.message = Array.isArray(response.details) ? response.details.map(e => e.errors.join(", ")).join(", ") : response.message;
                    this.details = response.details;
                } catch (e) {
                    inspect("Could not read response's error JSON.", body);
                }
            }
        } else {
            // A network error occurred.
            this.status = 503;
            this.statusText = "Service Unavailable";
            this.unauthorized = false;
        }
    }

    public unauthorized: boolean;

    public status: number;

    public statusText: string;

    public url: string;

    public details?: any;
}

export default class BaseService {
    constructor(private basePath: string, private defaultHeaders?: Object) { }

    private axios = AxiosFactory.create({
        // Never throw an error on non-200 responses
        validateStatus: () => true
    })

    protected async sendRequest<T>(path: string, method: "POST" | "PUT" | "GET" | "DELETE", bodyData?: any, qsData?: any) {
        const url = `${this.basePath}/${path}`;
        const request = this.axios.request({
            url,
            method: method,
            headers: Object.assign({
                "Accept": "application/json",
            }, this.defaultHeaders, bodyData ? { "Content-Type": "application/json" } : {}),
            params: qsData,
            data: bodyData,
        });

        let result: AxiosResponse;
        let body: T;

        try {
            result = await request;
            body = result.data;
        }
        catch (e) {
            // Axios was configured to only throw an error when a network error is encountered.
            inspect(`There was a problem the fetch operation for ${url}`, e);

            throw new ApiError();
        }

        if (!isOkay(result)) {
            throw new ApiError(body, result);
        }

        return body;
    }
}

export class Stages extends BaseService {
    constructor(authToken: string) {
        super("https://getstages.com/api", {
            "X-Stages-Access-Token": authToken,
            "X-Stages-API-Version": "1",
        });
    }

    public listSubscribers = (status: "all" | "subscribed" = "subscribed") => this.sendRequest<Subscriber[]>("admin/subscribers", "GET", undefined, { status })

    public countSubscribers = (status: "all" | "subscribed" = "subscribed") => this.sendRequest<{ count: number }>("admin/subscribers/count", "GET", undefined, { status });

    public getFinancials = () => this.sendRequest<Plan[]>("admin/financials", "GET");

    public async getSummary(status: "all" | "subscribed" = "subscribed"): Promise<Summary> {
        const subscribers = this.countSubscribers(status);
        const financials = this.getFinancials();

        const output: Summary = {
            totalActiveSubscribers: (await subscribers).count,
            totalMonthlyValue: (await financials).reduce((total, plan) => total + plan.ValueInCents, 0) / 100,
        }

        return output;
    }
}

export class KMSignalR extends BaseService {
    constructor(private authToken: string) {
        super("http://kmsignalr..com", {})
    }

    public getSummary = () => this.sendRequest<SummaryResult>(`/api/v1/orders/portraits/summary`, "GET")
}

export class Twitch extends BaseService {
    constructor(private client_id, private client_secret, private auth_token?: string) {
        super("https://api.twitch.tv/kraken", !!auth_token ? {
            "Authorization": `OAuth ${auth_token}`,
        } : undefined);
    }

    authorize = (data: {
        redirect_uri: string,
        code: string,
        state: string,
    }) => this.sendRequest<{ access_token: string, scopes: string[] }>(`oauth2/token`, "POST", { ...data, grant_type: "authorization_code", client_id: this.client_id, client_secret: this.client_secret });

    listFollowerStreams = (data?: {
        limit?: number;
        offset?: number;
        stream_type?: "all" | "playlist" | "live"
    }) => this.sendRequest<StreamsResponse>(`streams/followed`, "GET", undefined, data);
}

export class Blizzard extends BaseService {
    constructor(private secretKey: string) {
        super(`https://us.api.battle.net`)
    }

    listRealmStatuses(realms?: string[]) {
        return this.sendRequest<RealmStatuses>("wow/realm/status", "GET", undefined, {
            locale: "en_US",
            apikey: this.secretKey,
            realms: realms || []
        })
    }
}