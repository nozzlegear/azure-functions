// Learn more about F# at http://fsharp.org
open System
open Newtonsoft.Json
open Newtonsoft.Json.FSharp;
open Domain
open System.Net

type Loglevel =
    | Info
    | Warning
    | Error

let log level (data: 'T option) message =
    let levelStr = level.ToString()
    let dataStr =
        match data with
        | Some d -> Environment.NewLine + (JsonConvert.SerializeObject d)
        | None -> ""
    let dateStr = DateTime.UtcNow.ToString "o" // "o" is shorthand for iso datestring

    printfn "[%s] %s: %s%s" levelStr dateStr message dataStr

let envVarRequired name =
    let value = System.Environment.GetEnvironmentVariable name

    match value with
    | null -> raise (NullReferenceException <| sprintf "Required environment variable \"%s\" was null." name)
    | s -> s

let swuApiKey = envVarRequired "REDDIT_ROLLUP_SWU_KEY"
let swuTemplateId = envVarRequired "REDDIT_ROLLUP_SWU_TEMPLATE_ID"
let subs = [
    "politicaldiscussion"
    "birbs"
    "shaboozey"
    "thecompletionist"
    "warcraftlore"
    "halostory"
    "csharp"
    "fsharp"
    "dotnet"
    "typescript"
    "javascript"
    "coolgithubprojects"
    "asmr"
    "anxiety"
]

let resolutionFilter resolution =
    resolution.height < 700 && resolution.height > 300

let converter = Newtonsoft.Json.Converters.DiscriminatedUnionConverter()

let getTopPosts (count: int) (subreddit: string) =
    log Info None <| sprintf "Getting posts for subreddit %s" subreddit

    let url = sprintf "https://www.reddit.com/r/%s/top.json?sort=top&t=day" subreddit
    use client = new Http.HttpClient ()
    use request = client.GetAsync url
    use result =
        request
        |> Async.AwaitTask
        |> Async.RunSynchronously

    result.EnsureSuccessStatusCode() |> ignore

    let settings =
        JsonSerializerSettings()
        |> Newtonsoft.Json.FSharp.Serialisation.extend

    let body =
        result.Content.ReadAsStringAsync()
        |> Async.AwaitTask
        |> Async.RunSynchronously
        |> fun s -> JsonConvert.DeserializeObject<SubredditListResponse>(s, settings)

    match body.data.children with
    | c when c.Length >= 3 -> List.take count c
    | c -> c
    |> Seq.map (fun post -> post.data)

let convertPostToHtml (post: PostData) =
    let thumbnailValue =
        match post.thumbnail with
        | t when not (String.IsNullOrEmpty t) -> Some t
        | _ -> None
    let body =
        match (post, post.preview, thumbnailValue) with
        | (post, Some preview, _) when preview.images.Length > 0 ->
            let firstImage = preview.images |> Seq.head
            let image =
                match firstImage.resolutions |> Seq.tryFind resolutionFilter with
                | Some image -> image
                | None -> firstImage.source

            sprintf "<a href='%s' target='_blank'><img alt='%s' src='%s' /></a>" post.url post.title image.url;
        | (post, _, Some thumbnail) when thumbnail <> "self" ->
            sprintf "<a href='%s' target='_blank'><img alt='%s' src='%s' /></a>" post.url post.title thumbnail
        | (post, _, _) ->
            System.Net.WebUtility.HtmlDecode post.selftext_html

    let result =
        sprintf """
            <div class='post'>
                <p>
                    <a href='https://m.reddit.com/%s' target='_blank'>
                        <strong>%s:</strong>
                    </a>
                    <a href='https://m.reddit.com/%s'>
                        %s
                    </a>
                </p>
                %s
                <hr />
            </div>
        """ post.subreddit_name_prefixed post.subreddit_name_prefixed post.permalink post.title body

    result

let sendEmail (html: string): SendWithUsResponse =
    let subject = sprintf "Daily Reddit Rollup for %s." <| DateTime.UtcNow.ToString("MMM dd, yyyy");
    let openingHtml = sprintf "<h1>%s</h1><p>Showing the top 3 posts for the last 24 hours.</p><hr/>" subject;
    use body =
        {
            Files = []
            CC = []
            BCC = []
            EmailId = swuTemplateId
            Recipient =
                {
                    Name = "Joshua Harms"
                    Address = "joshua@nozzlegear.com"
                    ReplyTo = "joshua@nozzlegear.com"
                }
            Sender =
                {
                    Name = "Reddit Rollup"
                    Address = "reddit-rollup@nozzlegear.com"
                    ReplyTo = "reddit-rollup@nozzlegear.com"
                }
            EmailData =
            {
                rollup_html = openingHtml + html
                subject = subject
            }
        }
        |> JsonConvert.SerializeObject
        |> fun s -> new Http.StringContent(s, Text.Encoding.UTF8, "application/json")
    use client = new Http.HttpClient()
    use requestMessage = new Http.HttpRequestMessage(Http.HttpMethod.Post, "https://api.sendwithus.com/api/v1/send")

    requestMessage.Headers.Add("X-SWU-API-KEY", swuApiKey)
    requestMessage.Content <- body

    use request = client.SendAsync requestMessage
    let result =
        request
        |> Async.AwaitTask
        |> Async.RunSynchronously

    result.EnsureSuccessStatusCode() |> ignore

    result.Content.ReadAsStringAsync()
    |> Async.AwaitTask
    |> Async.RunSynchronously
    |> JsonConvert.DeserializeObject<SendWithUsResponse>

[<EntryPoint>]
let main argv =
    log Info None "Reddit Rollup is running."

    subs
    |> Seq.map(getTopPosts 3)
    |> Seq.collect(id)
    |> fun p ->
        Seq.length p |> sprintf "Retrieved %i posts." |> log Info None
        p
    |> Seq.map(convertPostToHtml)
    |> String.concat ""
    |> sendEmail
    |> ignore

    log Info None "Finished."

    0 // return an integer exit code