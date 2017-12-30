module Domain

open System.Collections.Generic

type LogLevel =
    | Info
    | Warning
    | Severe

type Tally = Dictionary<string, int>

type TallyTemplate = {
    source: string
    count: int
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
    startDate: string
    endDate: string
    tally: TallyTemplate list
}

type SwuMessage = {
    template: string
    recipient: SwuRecipient
    cc: SwuRecipient list
    sender: SwuSender
    template_data: SwuTallyTemplateData
}

type SwuResponse = {
    test: bool
}