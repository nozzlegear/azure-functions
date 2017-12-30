module SciTallyTool

open System
open System.Collections.Generic
open Newtonsoft.Json
open HttpFs.Client
open Hopac
open Domain

let log level (data: 'T option) message =
    let now = DateTime.Now.ToLongTimeString()
    let levelStr = level |> string
    let dataStr =
        match data with
        | Some d -> Environment.NewLine + "    " + JsonConvert.SerializeObject d
        | None -> ""

    sprintf "[%s] %s: %s%s" levelStr now message dataStr
    |> printfn "%s"

let envVarRequired key =
    let value = System.Environment.GetEnvironmentVariable key

    if isNull value then failwithf "Environment Variable \"%s\" was not found." key

    value

let envVarDefault key defaultValue =
    let value = System.Environment.GetEnvironmentVariable key

    match value with
    | s when isNull s || s = "" -> defaultValue
    | s -> s

let ifOptionIsSome (opt: 'optionType option) (ifOptionIsSomeFunc: 'optionType -> 'returnType -> 'returnType) (ifOptionIsNoneValue: 'returnType): 'returnType =
    match opt with
    | Some o -> ifOptionIsSomeFunc o ifOptionIsNoneValue
    | None -> ifOptionIsNoneValue

let prepareRequest method url authHeader body =
    let message =
        Request.createUrl method url
        |> ifOptionIsSome body (fun body message ->
            let serializedBody = JsonConvert.SerializeObject body
            let contentTypeHeader =
                ContentType.parse "application/json"
                |> Option.get
                |> RequestHeader.ContentType

            message
            |> Request.bodyString serializedBody
            |> Request.setHeader contentTypeHeader)
        |> ifOptionIsSome authHeader (fun header message -> message |> Request.setHeader header)

    message

let sendRequest request = job {
    use! response = getResponse request

    if response.statusCode <> 200 then failwithf "Request to %s failed with status code %i" (response.responseUri.ToString()) response.statusCode

    return! Response.readBodyAsString response
}

let midnight () = DateTime.Now.Date

let toJsTimestamp date = DateTimeOffset(date).ToUnixTimeMilliseconds()

let sendEmailMessage (tallyStartDate: DateTime) (tallyEndDate: DateTime) (tally: TallyTemplate list) = job {
    let emailDomain = envVarRequired "SCI_TALLY_EMAIL_DOMAIN"
    let isLive = (envVarDefault "SCI_TALLY_ENV" "development") = "production"
    let swuKey = envVarRequired "SCI_TALLY_SWU_KEY"
    let swuTemplateId = envVarRequired "SCI_TALLY_SWU_TEMPLATE_ID"
    let formatEmail name = sprintf "%s@%s" name emailDomain

    let emailRecipient: SwuRecipient =
        if isLive then { name = "Mike"; address = formatEmail "mikef" }
        else { name = "Joshua Harms"; address = formatEmail "josh" }
    let emailCcs: SwuRecipient list =
        if isLive then
            let listJson = envVarRequired "SCI_TALLY_CC_LIST"
            JsonConvert.DeserializeObject<SwuRecipient list>(listJson)
        else []
    let sender =
        {
            name = "KMSignalR Superintendent"
            address = formatEmail "superintendent"
            replyTo = formatEmail "superintendent"
        }

    let base64HeaderValue =
        sprintf "%s:" swuKey
        |> Text.Encoding.UTF8.GetBytes
        |> Convert.ToBase64String
    let header = Custom ("Authorization", sprintf "Basic %s" base64HeaderValue)
    let url = "https://api.sendwithus.com/api/v1/send"
    let message =
        {
            template = swuTemplateId
            recipient = emailRecipient
            cc = emailCcs
            sender = sender
            template_data =
                {
                    startDate = tallyStartDate.ToString "MMM dd, yyyy"
                    endDate = tallyEndDate.ToString "MMM dd, yyyy"
                    tally = tally
                }
        }
    let! response =
        prepareRequest HttpMethod.Post url (Some header) (Some message)
        |> sendRequest

    return response |> JsonConvert.DeserializeObject<SwuResponse>
}


[<EntryPoint>]
let main argv =
    let apiDomain = envVarDefault "SCI_TALLY_API_DOMAIN" "localhost:3000"

    sprintf "SCI Tally Tool executing with API domain %s." apiDomain
    |> log Info None

    let endDate = midnight ()
    let startDate = endDate.AddDays -7.
    let protocol = if String.contains "localhost" apiDomain then "http" else "https"
    let url =
        sprintf "%s://%s/api/v1/orders/tally/sources?since=%i&until=%i"
            protocol
            apiDomain
            (startDate |> toJsTimestamp)
            (endDate |> toJsTimestamp)

    // Make a request to the API and get tallies for each artist
    let summaryResponse =
        prepareRequest HttpMethod.Get url None None
        |> sendRequest
        |> run
        |> JsonConvert.DeserializeObject<Tally>

    match summaryResponse.Count with
    | 0 ->
        printfn "Tally response contained an empty summary. Was the `since` parameter (%i) incorrect?"
            (startDate |> toJsTimestamp)
    | _ ->
        summaryResponse
        |> Seq.iter (fun kvp -> printfn "%s: %i portraits" kvp.Key kvp.Value)

    try
        summaryResponse
        |> Seq.map (fun kvp -> { source = kvp.Key; count = kvp.Value })
        |> List.ofSeq
        |> sendEmailMessage startDate endDate
        |> run
        |> fun resp -> log Info (Some resp) "Received email response:"
    with
    | e ->
        log Severe (Some e) "API call to SendWithUs failed."
        reraise ()

    log Info None "SCI Tally Tool finished"

    0 // return an integer exit code
