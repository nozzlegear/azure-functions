declare module "kmsignalr" {
    export interface SummaryResult {
        total_orders: number;
        summaries: Summary[];
    }

    export interface Summary {
        /**
        The total number of portraits with this status.
        */
        current_count: number;
        /**
         * The status's id.
         */
        for_status: string;
        /**
        The status's label.
        */
        status_label: string;
        /**
        The status's hex color.
        */
        hex_color: string;
    }
}