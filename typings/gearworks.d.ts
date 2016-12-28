declare module "gearworks" {
    import { Schema } from "joi";
    import { Request, Response, NextFunction } from "express";

    //#region Routing

    export interface RouterRequest extends Request {
        validatedBody?: any;
        validatedQuery?: any;
        validatedParams?: any;
        domainWithProtocol: string;
    }

    export interface RouterResponse extends Response {
        
    }

    export interface RouterFunctionConfig {
        method: "get" | "post" | "put" | "delete" | "head" | "all",
        path: string,
        handler: (req: RouterRequest, res: RouterResponse, next: NextFunction) => void | any,
        cors?: boolean,
        requireAuth?: boolean,
        bodyValidation?: Schema,
        queryValidation?: Schema,
        paramValidation?: Schema,
        validateShopifyRequest?: boolean;
        validateShopifyWebhook?: boolean;
        validateShopifyProxyPage?: boolean;
    }

    export type RouterFunction = (config: RouterFunctionConfig) => void;

    //#endregion

    //#region Database

    export interface CouchDoc {
        /**
         * The object's database id.
         */
        _id?: string;

        /**
         * The object's database revision.
         */
        _rev?: string;
    }

    export interface ViewOptions extends ListOptions {
        reduce?: boolean;
        group?: boolean;
        group_level?: number;
    }

    /**
     * Options for listing database results.
     */
    export interface ListOptions {
        limit?: number;
        keys?: string[];
        start_key?: string | number;
        end_key?: string | number;
        inclusive_end?: boolean;
        descending?: boolean;
        skip?: number;
    }

    export interface AllDocsListResult<T> {
        rows: {
            id: string,
            key: string,
            value: {
                rev: string
            },
            doc: T
        }[],
        offset: number,
        total_rows: number
    }

    export interface Database<T extends CouchDoc> {
        list: (options?: ListOptions) => Promise<ListResponse<T>>;
        count: () => Promise<number>;
        get: (id: string, rev?: string) => Promise<T>;
        post: (data: T) => Promise<T>;
        put: (id: string, data: T, rev: string) => Promise<T>;
        delete: (id: string, rev: string) => Promise<void>;
        find: (selector: FindSelector) => Promise<T[]>;
        copy: (id: string, data: T, newId: string) => Promise<T>;
        exists: (id: string) => Promise<boolean>;
        view: <X>(design_doc_name: string, view_name: string, options?: ViewOptions) => Promise<ListResponse<X>>;
        reducedView: <X>(design_doc_name: string, view_name: string, options?: ViewOptions) => Promise<{ rows: X[] }>;
    }

    export interface CouchResponse {
        ok: boolean;
        id: string;
        rev: string;
    }

    export interface ListResponse<T> {
        offset: number;
        total_rows: number;
        rows: T[];
    }

    export interface FindSelector {
        fields?: string[];
        sort?: Object[];
        limit?: number;
        skip?: number;
        use_index?: Object;
        selector: Object;
    }

    export interface CouchDBView {
        map: string;
        reduce?: string;
    }

    export interface DesignDoc extends CouchDoc {
        views: { [name: string]: CouchDBView };
        language: "javascript";
    }

    export interface DatabaseConfiguration {
        name: string,
        indexes: string[],
        designDocs: {
            name: string,
            views: ({
                name: string,
            } & CouchDBView)[]
        }[],
    }

    //#endregion
}