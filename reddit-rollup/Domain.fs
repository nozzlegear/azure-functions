namespace RedditRollup.Domain

open Newtonsoft.Json

type MediaSource = {
    url: string
    width: int
    height: int
}

type Media  = {
    source: MediaSource
    resolutions: MediaSource list
}

type Variant = {
    obfuscated: Media
    nsfw: Media
    gif: Media
    mp4: Media
}

type Image = {
    variants: Variant
    source: MediaSource
    resolutions: MediaSource list
    id: string
}

type Preview  = {
    images: Image list
    enabled: bool
}

type PostData = {
    contest_mode: bool option
    banned_by: obj
    media_embed: obj
    subreddit: string
    selftext_html: string
    selftext: string
    likes: bool option
    suggested_sort: obj
    user_reports: obj list
    secure_media: obj
    link_flair_text: string
    id: string
    gilded: int option
    secure_media_embed: obj
    clicked: bool option
    score: int option
    report_reasons: obj
    author: string
    saved: bool option
    mod_reports: obj list
    name: string
    subreddit_name_prefixed: string
    approved_by: obj
    over_18: bool option
    domain: string
    hidden: bool option
    thumbnail: string
    subreddit_id: string
    edited: obj
    link_flair_css_class: string
    author_flair_css_class: obj
    downs: int option
    brand_safe: bool option
    archived: bool option
    removal_reason: obj
    is_self: bool option
    hide_score: bool option
    spoiler: bool option
    permalink: string
    num_reports: obj
    locked: bool option
    stickied: bool option
    created: double option
    url: string
    author_flair_text: obj
    quarantine: bool option
    title: string
    created_utc: double option
    distinguished: obj
    media: obj
    num_comments: int option
    visited: bool option
    subreddit_type: string
    ups: int option
    preview: Preview option
}

type Post = {
    kind: string
    data: PostData
}

type SubredditListData = {
    modhash: string
    children: Post list
    after: obj
    before: obj
}

type SubredditListResponse = {
    kind: string
    data: SubredditListData
}

type AccessTokenGrantResponse = {
    access_token: string
    token_type: string
    expires_in: int64 option
    scope: string
}

type Email = {
    [<JsonProperty("address")>]
    Address: string

    [<JsonProperty("name")>]
    Name: string

    [<JsonProperty("reply_to")>]
    ReplyTo: string
}

type SendWithUsFile = {
    /// <summary>
    /// The file's filename.
    /// </summary>
    [<JsonProperty("id")>]
    Id: string

    /// <summary>
    /// The file's base64-encoded data.
    /// </summary>
    [<JsonProperty("data")>]
    Data: string
}

type SendWithUsData = {
    [<JsonProperty("email_id")>]
    EmailId: string

    [<JsonProperty("recipient")>]
    Recipient: Email

    [<JsonProperty("sender")>]
    Sender: Email

    [<JsonProperty("email_data")>]
    EmailData: obj

    /// <summary>
    /// Adds the given files to the email as attachments.
    /// </summary>
    [<JsonProperty("files")>]
    Files: SendWithUsFile list

    [<JsonProperty("cc")>]
    CC: Email list

    [<JsonProperty("bcc")>]
    BCC: Email list
}


type RollupEmailData = {
    rollup_html: string
    subject: string
}

type SendWithUsResponse = {
    Success: bool
    ErrorMessage: string
    Status: string
    [<JsonProperty("receipt_id")>]
    ReceiptId: string
    Email: Email
}