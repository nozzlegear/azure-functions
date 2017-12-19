// Learn more about F# at http://fsharp.org
namespace RedditRollup
module public AzureFunction =

    open System
    open Microsoft.Azure.WebJobs
    open Microsoft.Azure.WebJobs.Host
    open Newtonsoft.Json
    open Domain
    open System.Net

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

    let getTopPosts (count: int) (subreddit: string) =
        let url = sprintf "https://www.reddit.com/r/{%s}/top.json?sort=top&t=day" subreddit
        use client = new Http.HttpClient ()
        use request = client.GetAsync url
        use result =
            request
            |> Async.AwaitTask
            |> Async.RunSynchronously

        result.EnsureSuccessStatusCode() |> ignore

        let body =
            result.Content.ReadAsStringAsync()
            |> Async.AwaitTask
            |> Async.RunSynchronously
            |> JsonConvert.DeserializeObject<SubredditListResponse>

        body.data.children
        |> Seq.take count
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
                            {post.title}
                        </a>
                    </p>
                    %s
                    <hr />
                </div>
            """ post.subreddit_name_prefixed post.subreddit_name_prefixed post.permalink body

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
                        Address = "nozzlegear@outlook.com"
                        ReplyTo = "nozzlegear@outlook.com"
                    }
                Sender =
                    {
                        Name = "Reddit Rollup"
                        Address = "reddit-rollup@nozzlegear.com"
                        ReplyTo = "reddit-rollup@nozzlegear.com"
                    }
                EmailData =
                {
                    rollup_html = html
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

    let public Send(myTimer: TimerInfo, log: TraceWriter) =
        subs
        |> Seq.map(getTopPosts 3)
        |> Seq.collect(id)
        |> Seq.map(convertPostToHtml)
        |> String.concat ""
        |> sendEmail
        |> ignore

        0 // return an integer exit code
