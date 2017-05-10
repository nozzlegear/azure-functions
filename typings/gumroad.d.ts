declare module "gumroad-api" {
    class Gumroad {
        constructor(options: { token: string })

        listSales(afterDate: string, beforeDate: string, pageNumber: number): Promise<Gumroad.ListResponse>;
        getSale(saleId: string): Promise<Gumroad.GetResponse>;
    }

    namespace Gumroad {
        export interface GetResponse {
            success: boolean;
            sale: Sale;
        }

        export interface ListResponse {
            success: boolean;
            next_page_url: string;
            sales: Sale[];
        }

        export interface Sale {
            id: string;
            email: string;
            timestamp: string;
            created_at: string;
            product_name: string;
            price: number;
            subscription_duration: string;
            formatted_display_price: string;
            formatted_total_price: string;
            product_id: string;
            purchase_email: string;
            full_name: string;
            paid: boolean;
            variants: string;
            variants_and_quantity: string;
            has_custom_fields: boolean;
            custom_fields: any;
            order_id: number;
            is_product_physical: boolean;
            purchaser_id: string;
            is_recurring_billing: boolean;
            is_following: boolean;
            subscription_id: string;
            cancelled: boolean;
            ended: boolean;
            referrer: string;
        }
    }

    export = Gumroad;
}