declare module "stages" {
    /**
    A sanitized version of a Stages account. Does not include personal user information or sensitive data.
    */
    export interface Subscriber {
        Id: number;

        Plan: Plan;

        AccountOwner: string;

        IsSubscribed: boolean;

        DateCreated: Date;

        NextChargeDate: Date;

        ReasonForCancellation: string;

        ShopifyShopName: string;

        ShopifyShopDomain: string;
    }

    /**
    A Stages subscription plan.
    */
    export interface Plan {
        Id: string;

        StripeId: string;

        Name: string;

        ValueInCents: number;

        Value: string;

        MemberLimit: number;
    }

    /**
     * A summary of subscribers and total monthly value.
     */
    export interface Summary {
        totalActiveSubscribers: number;
        totalMonthlyValue: number;
    }
}