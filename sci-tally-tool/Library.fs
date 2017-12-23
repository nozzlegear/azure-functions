module SciTallyTool

    open System
    open System.Collections.Generic
    open Microsoft.Azure.WebJobs
    open Microsoft.Azure.WebJobs.Host
    open Newtonsoft.Json
    open HttpFs.Client
    open Hopac

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
        date: string
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

    let sendEmailMessage (tallyStartDate: DateTime) (tally: TallyTemplate list) = job {
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
                        date = tallyStartDate.ToString ("MMM dd, yyyy")
                        tally = tally
                    }
            }
        let! response =
            prepareRequest HttpMethod.Post url (Some header) (Some message)
            |> sendRequest

        return response |> JsonConvert.DeserializeObject<SwuResponse>
    }

    let public Run(myTimer: TimerInfo, log: TraceWriter) =

        sprintf "SCI Tally Tool executing at: %s" (DateTime.Now.ToString())
        |> log.Info

        let apiDomain = envVarDefault "SCI_TALLY_API_DOMAIN" "localhost:3000"

        sprintf "The API domain being used is: %s" apiDomain
        |> log.Info

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

        let emailResponse =
            try
                summaryResponse
                |> Seq.map (fun kvp -> { source = kvp.Key; count = kvp.Value })
                |> List.ofSeq
                |> sendEmailMessage startDate
                |> run
            with
            | e ->
                log.Error("API call to SendWithUs failed.", e)
                reraise ()

        sprintf "SCI Tally Tool finished at: %s" (DateTime.Now.ToString())
        |> log.Info