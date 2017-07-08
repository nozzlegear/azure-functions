declare module "azure-functions" {
    export interface Response {
        status?: number;
        body: string;
    }

    export interface Context {
        log: (...args) => void;
        res: Response;
        /**
         * Tells the Azure function that the request is done processing and it should return the response.
         */
        done: () => void;
    }

    export interface Request<QueryType = any, BodyType = any> {
        query: QueryType;
        body: BodyType;
    }
}