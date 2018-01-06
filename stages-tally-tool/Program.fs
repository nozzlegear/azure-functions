// Learn more about F# at http://fsharp.org

open System
open System.Net.Http
open Newtonsoft.Json
open Domain

type Loglevel =
    | Info
    | Warning
    | Error

type Endpoint =
    | Financials
    | Subscribers
    | SubscriberCount

let log level (data: 'T option) message =
    let levelStr = level.ToString()
    let dataStr =
        match data with
        | Some d -> Environment.NewLine + (JsonConvert.SerializeObject d)
        | None -> ""
    let dateStr = DateTime.UtcNow.ToString "o" // "o" is shorthand for iso datestring

    printfn "[%s] %s: %s%s" levelStr dateStr message dataStr

let envVar key =
    match Environment.GetEnvironmentVariable key with
    | null
    | "" -> None
    | s -> Some s

let envVarRequired key =
    match envVar key with
    | Some s -> s
    | None ->
        sprintf "Environment variable \"%s\" was not found." key
        |> NullReferenceException
        |> raise

let envVarDefault key defaultValue =
    envVar key |> Option.defaultValue defaultValue

let envIsLive() =
    let envStr = envVarDefault "STAGES_TALLY_ENV" "development"
    let qs = envVarDefault "Http_Query" ""

    envStr = "production" || qs.Contains "env=production"

let buildApiUrl endpoint =
    let apiDomain = envVarRequired "STAGES_TALLY_API_DOMAIN"
    let protocol = if apiDomain.Contains "localhost" then "http" else "https"
    let path =
        match endpoint with
        | Financials -> "financials"
        | Subscribers -> "subscribers?status=subscribed"
        | SubscriberCount -> "subscribers/count?status=subscribed"

    sprintf "%s://%s/api/admin/%s" protocol apiDomain path

let buildStagesAuthHeaders authToken =
    [
        "X-Stages-Access-Token", authToken
        "X-Stages-API-Version", "1"
    ]
    |> Map.ofList

let buildSwuAuthHeaders (swuToken: string) =
    let headerValue =
        sprintf "%s:" swuToken
        |> Text.Encoding.UTF8.GetBytes
        |> Convert.ToBase64String
        |> sprintf "Basic %s"

    Map.ofList ["Authorization", headerValue]

let makeRequest url method (customHeaders: Map<string, string>) (body: 'T option) = async {
    use client = new HttpClient()
    use msg = new HttpRequestMessage()
    msg.RequestUri <- Uri url
    msg.Method <- method

    if Option.isSome body then
        let json = Option.get body |> JsonConvert.SerializeObject
        msg.Content <- new StringContent(json, Text.Encoding.UTF8, "application/json")

    customHeaders
    |> Seq.iter (fun i -> msg.Headers.Add(i.Key, i.Value))

    let! response = client.SendAsync msg |> Async.AwaitTask
    let! responseBody = response.Content.ReadAsStringAsync() |> Async.AwaitTask

    if not response.IsSuccessStatusCode then
        let msg = sprintf "Request to %s failed with %i %s" url (int response.StatusCode) response.ReasonPhrase

        log Error None (sprintf "%s Response body: %s" msg responseBody)

        HttpRequestException msg |> raise

    return responseBody
}

let buildEmailData tally: SwuMessage =
    let emailDomain = envVarRequired "STAGES_TALLY_EMAIL_DOMAIN"
    let swuTemplateId = envVarRequired "STAGES_TALLY_SWU_TEMPLATE_ID"
    let recipient = { address = sprintf "joshua@%s" emailDomain; name = "Joshua Harms" }
    let sender =
        { address = sprintf "superintendent@%s" emailDomain
          replyTo = sprintf "superintendent@%s" emailDomain
          name = sprintf "Superintendent" }

    { template = swuTemplateId
      recipient = recipient
      sender = sender
      cc = []
      template_data =
        { tally = tally
          date = DateTime.UtcNow.ToString("MMM dd, yyyy") } }

[<EntryPoint>]
let main argv =
    log Info None "Stages Tally Tool starting up."

    let stagesHeaders = envVarRequired "STAGES_TALLY_API_KEY" |> buildStagesAuthHeaders
    let swuHeaders = envVarRequired "STAGES_TALLY_SWU_KEY" |> buildSwuAuthHeaders
    let financialsUrl = buildApiUrl Financials
    let countUrl = buildApiUrl SubscriberCount

    sprintf "Getting data from %s and %s." financialsUrl countUrl
    |> log Info None

    let totalValue =
        makeRequest financialsUrl HttpMethod.Get stagesHeaders None
        |> Async.RunSynchronously
        |> JsonConvert.DeserializeObject<SubscriberPlan list>
        |> Seq.fold (fun value plan -> value + plan.ValueInCents) 0
        |> fun v -> v / 100 // Divide cents by 100 for dollar amount
    let count =
        makeRequest countUrl HttpMethod.Get stagesHeaders None
        |> Async.RunSynchronously
        |> JsonConvert.DeserializeObject<CountResult>

    let emailMessage =
        { totalActiveSubscribers = count.count
          totalMonthlyValue = totalValue }
        |> buildEmailData

    sprintf "Sending to: %s" emailMessage.recipient.address
    |> log Info None

    emailMessage.cc
    |> Seq.map (fun i -> i.address)
    |> Seq.iter (sprintf "CCed to: %s" >> log Info None)

    let emailResult =
        Some emailMessage
        |> makeRequest "https://api.sendwithus.com/api/v1/send" HttpMethod.Post swuHeaders
        |> Async.RunSynchronously

    sprintf "Send result: %s" emailResult
    |> log Info None

    0 // return an integer exit code
