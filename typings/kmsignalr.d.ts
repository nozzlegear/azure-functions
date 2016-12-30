declare module "kmsignalr" {
    export interface PortraitSummary {
        Result: {
            /**
            The total number of portrait orders.
            */
            Total: number;

            Data: PortraitStatus[];
        }
    }

    export interface PortraitStatus {
        /**
        The status's label.
        */
        Label: string;

        /**
        The status's hex color.
        */
        Color: string;

        /**
        The total number of portraits with this status.
        */
        Count: number;
    }
}