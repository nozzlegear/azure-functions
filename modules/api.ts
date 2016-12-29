import inspect from "logspect";
import isOkay from "./axios_utils";
import * as Bluebird from "bluebird";
import Axios, { AxiosResponse } from "axios";
import { AUTH_HEADER_NAME } from "./constants";
import { Plan, Subscriber, Summary } from "stages";

export class ApiError extends Error {
    constructor(body?: string | Object, axiosResponse?: AxiosResponse) {
        super("Something went wrong and your request could not be completed.");

        if (!!axiosResponse) {
            this.unauthorized = axiosResponse.status === 401;
            this.status = axiosResponse.status;
            this.statusText = axiosResponse.statusText;

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

    public details?: any;
}

export default class BaseService {
    constructor(private basePath: string, private defaultHeaders?: Object) { }

    protected async sendRequest<T>(path: string, method: "POST" | "PUT" | "GET" | "DELETE", bodyData?: any, qsData?: any) {
        const url = `${this.basePath}/${path}`;
        const request = Axios({
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
        const summary = await Bluebird.props({
            subscribers: this.countSubscribers(status),
            financials: this.getFinancials(),
        }) as { subscribers: { count: number }, financials: Plan[] };
        const output: Summary = {
            totalActiveSubscribers: summary.subscribers.count,
            totalMonthlyValue: summary.financials.reduce((total, plan) => total + plan.ValueInCents, 0) / 100,
        }

        return output;
    }
}