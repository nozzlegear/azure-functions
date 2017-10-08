namespace ArtistTallyTool
module public AzureFunction =

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

    let toJsTimestamp date = DateTimeOffset(date).ToUnixTimeMilliseconds()

    let convertResponseToTally (summary: Dictionary<string, int>) = 
        summary 
        |> Seq.map(fun kvp -> { artist = kvp.Key; count = kvp.Value })

    let sendEmailMessage (tallyStartDate: DateTime) (tally: seq<EmailTally>) = job {
        let emailDomain = envVarRequired "ARTIST_TALLY_EMAIL_DOMAIN"
        let isLive = (envVarDefault "ARTIST_TALLY_ENV" "development") = "production"
        let swuKey = envVarRequired "ARTIST_TALLY_SWU_KEY"
        let swuTemplateId = envVarRequired "ARTIST_TALLY_SWU_TEMPLATE_ID"
        let formatEmail name = sprintf "%s@%s" name emailDomain

        let emailRecipient: SwuRecipient = 
            if isLive then { name = "Mike"; address = formatEmail "mikef" }
            else { name = "Joshua Harms"; address = formatEmail "josh" }
        let emailCcs: SwuRecipient list =
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
                        date = tallyStartDate.ToString ("MMM dd, yyyy")
                        tally = tally
                    }
            }
        let! response =
            prepareRequest HttpMethod.Post url (Some header) (Some message)
            |> sendRequest
        
        return response |> Compact.deserialize<SwuResponse>
    }

    // [<Microsoft.Azure.WebJobs.FunctionNameAttribute("std-artist-tally-tool")>]
    let public Run(myTimer: TimerInfo, log: TraceWriter) =
        
        sprintf "Artist Tally Tool in a dotnet netstandard2.0 library is executing at: %s" (DateTime.Now.ToString())
        |> log.Info

        let apiDomain = envVarDefault "ARTIST_TALLY_API_DOMAIN" "localhost:3000"

        sprintf "The API domain being used is: %s" apiDomain
        |> log.Info

        let startDate = midnightYesterday ()
        let endDate = midnight ()
        let protocol = if String.contains "localhost" apiDomain then "http" else "https"
        let url = 
            sprintf "%s://%s/api/v1/orders/portraits/artist-tally?since=%i&until=%i" 
                protocol 
                apiDomain 
                (startDate |> toJsTimestamp)
                (endDate |> toJsTimestamp)

        // Make a request to the API and get tallies for each artist
        let summaryResponse =
            prepareRequest HttpMethod.Get url None None
            |> sendRequest
            |> run
            |> Compact.deserialize<TallyResponse>

        match summaryResponse.summary.Count with
        | 0 -> 
            printfn "Tally response contained an empty summary. Was the `since` parameter (%i) incorrect?" 
                (startDate |> toJsTimestamp)
        | _ -> 
            summaryResponse.summary
            |> Seq.iter (fun kvp -> printfn "%s: %i portraits" kvp.Key kvp.Value)

        let emailResponse =
            try 
                summaryResponse.summary
                |> convertResponseToTally
                |> sendEmailMessage startDate
                |> run
            with 
            | e -> 
                log.Error("API call to SendWithUs failed.", e)
                reraise ()

        sprintf "Artist Tally Tool finished at: %s" (DateTime.Now.ToString())
        |> log.Info