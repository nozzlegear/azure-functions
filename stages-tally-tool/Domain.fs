module Domain

open System

/// A Stages subscription plan.
type SubscriberPlan = {
    Id: string
    StripeId: string
    Name: string
    ValueInCents: int
    Value: string
    MemberLimit: int
}

/// A sanitized version of a Stages account. Does not include personal user information or sensitive data.
type Subscriber = {
    Id: int
    Plan: SubscriberPlan
    AccountOwner: string
    IsSubscribed: bool
    DateCreated: DateTime
    NextChargeDate: DateTime
    ReasonForCancellation: string
    ShopifyShopName: string
    ShopifyShopDomain: string
}

type CountResult = {
    count: int
}

type TallyResponse = {
    since: int
    summary: Map<string, int>
}

type TallyTemplate = {
    totalActiveSubscribers: int
    totalMonthlyValue: int
}

type SwuRecipient = {
  name: string
  address: string
}

type SwuSender = {
    name: string
    address: string
    replyTo: string
}

type SwuTallyTemplateData = {
    date: string
    tally: TallyTemplate
}

type SwuMessage = {
    template: string
    recipient: SwuRecipient
    cc: SwuRecipient list
    sender: SwuSender
    template_data: SwuTallyTemplateData
}