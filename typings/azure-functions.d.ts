declare module "azure-functions" {
    export interface Response {
        status?: number;
        body: string;
        headers?: object;
        /**
         * Indicates that formatting is skipped for the response.
         */
        isRaw?: boolean;
    }

    type Log = (...args) => void | {
        error: (...args) => void;
    };

    export interface Context {
        log: {
            (...args): void;
            error: (...args) => void;
            warn: (...args) => void;
            info: (...args) => void;
            verbose: (...args) => void;
        };
        res: Response;
        /**
         * Tells the Azure function that the request is done processing and it should return the response.
         */
        done: () => void;
        bindings: any;
        bindingData: any;
    }

    export interface Request {
        query: any;
        body: any;
        headers: any;
        method: string;
        originalUrl: string;
        params: any;
        rawBody: string;
    }
}