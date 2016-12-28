import inspect from "logspect";
import isOkay from "./axios_utils";
import { resolve, reject } from "bluebird";
import Axios, { AxiosResponse } from "axios";
import { AUTH_HEADER_NAME } from "./constants";

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
    constructor(private basePath?: string, private authToken?: string) { }

    protected async sendRequest<T>(path: string, method: "POST" | "PUT" | "GET" | "DELETE", bodyData?: any, qsData?: any) {
        const url = `${this.basePath}/${path}`.replace(/\/\/+/i, "/");
        const request = Axios({
            url,
            method: method,
            headers: {
                "Content-Type": bodyData ? "application/json" : undefined,
                [AUTH_HEADER_NAME]: this.authToken || undefined,
            },
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
    constructor(authToken?: string) {
        super("https://getstages.com/api/v1/", authToken);
    }

    public getFinancials = () => this.sendRequest<any>("", "GET");
}