import * as got from 'got';
import * as R from 'ramda';
import { env } from 'process';
import { EOL } from 'os';
import stdin = require("get-stdin")

enum LogLevel {
    Info,
    Warning,
    Severe
}

type RequestHeaders = { [headerName: string]: string }

// Sugar function to execute a block and return its value. Equivalent to the following in F#:
// let myValue =
//   // Do a bunch of stuff here that never comes out of the scope of myValue
//   someValue
function block<T>(fn: () => T): T {
    return fn()
}

function log(level: LogLevel, message: string, extraData?: any | undefined) {
    const levelStr = block(() => {
        switch (level) {
            case LogLevel.Info:
                return "Info"
            case LogLevel.Warning:
                return "Warning"
            case LogLevel.Severe:
                return "Severe"
        }
    })
    const dataStr = !extraData ? "" : `${EOL}    ${JSON.stringify(extraData)}`

    console.log(`[${levelStr}] ${message}`, extraData);
}

function envVarRequired(key: string) {
    const value = env[key]

    if (!value) {
        throw `Environment variable "${key}" was empty.`
    }

    return value
}

function envVarDefault(key: string, defaultValue: string) {
    const value = env[key]

    return !!value ? value : defaultValue
}

function getMidnight() {
    const now = new Date()

    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
}

function buildApiUrl(startDate: Date, endDate: Date) {
    const apiDomain = envVarDefault("SCI_TALLY_API_DOMAIN", "localhost:3000")
    const protocol = apiDomain.indexOf("localhost") > -1 ? "http" : "https"

    return `${protocol}://${apiDomain}/api/v1/orders/tally/sources?since=${startDate.getTime()}&until=${endDate.getTime()}`
}

function ensureSuccessResponse(resp: got.Response<string>) {
    if (!resp.statusCode || resp.statusCode < 200 || resp.statusCode >= 300) {
        const message = `Request to ${resp.url} failed with ${resp.statusCode} ${resp.statusMessage}.`

        log(LogLevel.Severe, message, { body: resp.body })

        throw new Error(message)
    }
}

async function makeRequest(url: string, method: "GET" | "POST", extraData: Partial<{ body: string, headers: RequestHeaders }> = {}) {
    extraData = {
        headers: {},
        ...extraData
    }

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(extraData.headers || {})
    }

    let resp: got.Response<string>;

    try {
        resp = await got(url, { method: method, headers: headers, body: extraData.body })
    } catch (e) {
        log(LogLevel.Severe, `Request to ${url} failed to complete.`, e);

        throw e
    }

    ensureSuccessResponse(resp)

    return resp
}

function makeGetRequest(url: string, headers: RequestHeaders | undefined = undefined) {
    return makeRequest(url, "GET", { headers })
}

function makePostRequest<T>(url: string, body: T, headers: RequestHeaders | undefined = undefined) {
    return makeRequest(url, "POST", { headers, body: JSON.stringify(body) })
}

function buildEmailData(startDate: Date, endDate: Date, tally: TallyTemplate[]) {
    const emailDomain = envVarRequired("SCI_TALLY_EMAIL_DOMAIN")
    const isLive = envVarDefault("SCI_TALLY_ENV", "development") === "production"
    const swuTemplateId = envVarRequired("SCI_TALLY_SWU_TEMPLATE_ID")
    const formatEmail = (name: string) => `${name}@${emailDomain}`
    const emailRecipient = isLive
        ? new SwuRecipient("Mike", formatEmail("mikef"))
        : new SwuRecipient("Joshua Harms", formatEmail("josh"))
    const ccs: SwuRecipient[] = isLive
        ? JSON.parse(envVarRequired("SCI_TALLY_CC_LIST"))
        : []
    const sender = new SwuSender("KMSignalR Superintendent", formatEmail("superintendent"), formatEmail("superintendent"))
    const startDateStr = startDate.toLocaleDateString("en-US", { day: "numeric", year: "numeric", month: "short" })
    const endDateStr = endDate.toLocaleDateString("en-US", { day: "numeric", year: "numeric", month: "short" })

    return new SwuMessage(swuTemplateId, emailRecipient, ccs, sender, new SwuTallyTemplateData(startDateStr, endDateStr, tally))
}

async function main(input: string) {
    log(LogLevel.Info, "SCI Tally Tool starting up.")

    const endDate = getMidnight()
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 7)
    const tallyUrl = buildApiUrl(startDate, endDate)

    log(LogLevel.Info, `Getting tally from ${tallyUrl}.`)

    const tallies =
        R.pipe(
            (r: got.Response<string>) => r.body,
            s => JSON.parse(s) as { [source: string]: number },
            o => Object.getOwnPropertyNames(o).map(prop => new TallyTemplate(prop, o[prop]))
        )(await makeGetRequest(tallyUrl))
    const message = buildEmailData(startDate, endDate, tallies)

    log(LogLevel.Info, "Using email message data:", message)

    const headers: RequestHeaders = {
        "Authorization": R.pipe(
            (s: string) => `${s}:`,
            s => new Buffer(s).toString("base64"),
            s => `Basic ${s}`
        )(envVarRequired("SCI_TALLY_SWU_KEY"))
    }
    const emailResult = await makePostRequest("https://api.sendwithus.com/api/v1/send", message, headers)

    log(LogLevel.Info, "Completed with SWU response:", emailResult.body)
}

stdin().then(main).catch(r => log(LogLevel.Severe, "Main function failed with:", r))

class TallyTemplate {
    constructor(public source: string, public count: number) { }
}

class SwuRecipient {
    constructor(public name: string, public address: string) { }
}

class SwuSender extends SwuRecipient {
    constructor(name: string, address: string, public replyTo: string) {
        super(name, address)
    }
}

class SwuTallyTemplateData {
    constructor(public startDate: string, public endDate: string, public tally: TallyTemplate[]) { }
}

class SwuMessage {
    constructor(public template: string, public recipient: SwuRecipient, public cc: SwuRecipient[], public sender: SwuSender, public template_data: SwuTallyTemplateData) { }
}