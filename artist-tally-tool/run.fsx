#r "../packages/Newtonsoft.Json/lib/net45/Newtonsoft.Json.dll"
#r "../packages/Microsoft.FSharpLu/lib/net452/Microsoft.FSharpLu.dll"
#r "../packages/Microsoft.FSharpLu.Json/lib/net452/Microsoft.FSharpLu.Json.dll"
#r "../packages/Microsoft.Azure.WebJobs/lib/net45/Microsoft.Azure.WebJobs.Host.dll"
#r "../packages/Microsoft.Azure.WebJobs.Core/lib/net45/Microsoft.Azure.WebJobs.dll"
#r "../packages/Microsoft.Azure.WebJobs.Extensions/lib/net45/Microsoft.Azure.WebJobs.Extensions.dll"
#r "../packages/Hopac/lib/net45/Hopac.Core.dll"
#r "../packages/Hopac/lib/net45/Hopac.dll"
#r "../packages/Hopac/lib/net45/Hopac.Platform.dll"
#r "../packages/Http.fs/lib/net40/HttpFs.dll"

open System
open System.Net
open System.Threading
open System.Collections.Generic
open Microsoft.Azure.WebJobs
open Microsoft.Azure.WebJobs.Host
open Microsoft.Azure.WebJobs.Extensions
open Microsoft.FSharpLu.Json
open HttpFs.Client
open Hopac

type TallyResponse = {
    since: int64
    summary: Dictionary<string, int>
}

type EmailTally = {
    artist: string
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
    date: string
    tally: EmailTally seq
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

let envVarRequired key = 
    let value = System.Environment.GetEnvironmentVariable key

    if isNull value then failwithf "Environment Variable \"%s\" was not found." key

    value

let envVarDefault key defaultValue =
    let value = System.Environment.GetEnvironmentVariable key

    if isNull value then defaultValue else value

let swuKey = envVarRequired "ARTIST_TALLY_SWU_KEY"
let swuTemplateId = envVarRequired "ARTIST_TALLY_SWU_TEMPLATE_ID"
let emailDomain = envVarRequired "ARTIST_TALLY_EMAIL_DOMAIN"
let apiDomain = envVarDefault "ARTIST_TALLY_API_DOMAIN" "localhost:3000"
let isLive = (envVarDefault "ARTIST_TALLY_ENV" "development") = "production"

let ifOptionIsSome (opt: 'optionType option) (ifOptionIsSomeFunc: 'optionType -> 'returnType -> 'returnType) (ifOptionIsNoneValue: 'returnType): 'returnType = 
    match opt with 
    | Some o -> ifOptionIsSomeFunc o ifOptionIsNoneValue
    | None -> ifOptionIsNoneValue

let prepareRequest method url authHeader body = 
    let message = 
        Request.createUrl method url
        |> ifOptionIsSome body (fun body message -> 
            let serializedBody = Compact.serialize body
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
let midnightYesterday () = midnight().AddDays -1.

let toUnixTimestamp date = DateTimeOffset(date).ToUnixTimeMilliseconds()

let convertResponseToTally (summary: Dictionary<string, int>) = 
    summary |> Seq.map(fun kvp -> { artist = kvp.Key; count = kvp.Value })

let formatEmail name = sprintf "%s@%s" name emailDomain

let emailRecipient = 
    if isLive then { name = "Mike"; address = formatEmail "mikef" }
    else { name = "Joshua Harms"; address = formatEmail "josh" }

let emailCcs =
    if isLive then 
        [
            {
                name = "Tim"
                address = formatEmail "tim"
            }
            {
                name = "Jeanette"
                address = formatEmail "jeanette"
            }
            {
                name = "Joshua Harms"
                address = formatEmail "josh"
            }
        ]
    else []    

let sendEmailMessage (tally: seq<EmailTally>) = job {
    let base64HeaderValue = sprintf "%s:" swuKey |> Text.Encoding.UTF8.GetBytes |> Convert.ToBase64String
    //Http.Headers.AuthenticationHeaderValue ("Basic", base64HeaderValue)
    let header = Custom ("Authentication", sprintf "Basic %s" base64HeaderValue) 
    let url = "https://api.sendwithus.com/api/v1/send"
    let date = DateTime.Now.ToString ("MMM dd, yyyy")
    let message = 
        {
            template = swuTemplateId
            recipient = emailRecipient
            cc = emailCcs
            sender = 
                {
                    name = "KMSignalR Superintendent"
                    address = formatEmail "superintendent"
                    replyTo = formatEmail "superintendent" 
                }
            template_data = 
                {
                    date = date
                    tally = tally
                }
        }
    let! response =
        prepareRequest HttpMethod.Post url (Some header) (Some message)
        |> sendRequest
    
    return response |> Compact.deserialize<SwuResponse>
}

let Run(myTimer: TimerInfo, log: TraceWriter) =
    sprintf "Artist Tally Tool executing at: %s" (DateTime.Now.ToString())
    |> log.Info

    let since = midnightYesterday () |> toUnixTimestamp
    let until = midnight () |> toUnixTimestamp
    let protocol = if isLive then "https" else "http"
    let url = sprintf "%s://%s/api/v1/orders/portraits/artist-tally?since=%i&until=%i" protocol apiDomain since until
    let summaryResponse =
        prepareRequest HttpMethod.Get url None None
        |> sendRequest
        |> run
        |> Compact.deserialize<TallyResponse>

    match summaryResponse.summary.Count with
    | 0 -> printfn "Tally response contained an empty summary. Was the `since` parameter (%i) incorrect?" since
    | _ -> summaryResponse.summary
           |> Seq.iter (fun kvp -> printfn "%s: %i portraits" kvp.Key kvp.Value)

    let emailResponse =
        summaryResponse.summary
        |> convertResponseToTally
        |> sendEmailMessage
        |> run

    sprintf "Artist Tally Tool finished at: %s" (DateTime.Now.ToString())
    |> log.Info