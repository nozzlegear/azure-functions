@MirrorsUsed()
import "dart:async";
import "dart:io";
import "dart:mirrors";
import "dart:convert" show UTF8, JSON, BASE64;
import "package:logging/logging.dart";
import "package:intl/intl.dart" show DateFormat;
import 'package:json_god/json_god.dart' as god;

final Logger log = new Logger("main");

String envVarRequired(String key) {
  if (Platform.environment.containsKey(key)) {
    return Platform.environment[key];
  }

  throw "Environment variable \"${key}\" was empty.";
}

String envVarDefault(String key, String defaultValue) {
  if (Platform.environment.containsKey(key)) {
    return Platform.environment[key];
  }

  return defaultValue;
}

DateTime getMidnight() {
  DateTime now = new DateTime.now();

  return new DateTime(now.year, now.month, now.day);
}

String buildApiUrl(DateTime startDate, DateTime endDate) {
  String apiDomain = envVarDefault("SCI_TALLY_API_DOMAIN", "localhost:3000");
  String protocol = apiDomain.contains("localhost") ? "http" : "https";

  return "$protocol://$apiDomain/api/v1/orders/tally/sources?since=${startDate.millisecondsSinceEpoch}&until=${endDate.millisecondsSinceEpoch}";
}

Future<HttpClientResponse> makeRequest<T>(Uri url, String method,
    {T body = null, Map<String, String> headers = null}) async {
  HttpClientRequest req = await new HttpClient().openUrl(method, url)
    ..headers.contentType = ContentType.JSON
    ..headers.add("Accept", ContentType.JSON);

  if (headers != null) {
    headers.forEach((key, value) => req.headers.set(key, value));
  }

  if (body != null) {
    req.write(god.serialize(body));
  }

  return await req.close();
}

void ensureSuccessResponse(HttpClientResponse resp) {
  if (resp.statusCode < 200 || resp.statusCode >= 300) {
    throw new StateError(
        "Request to ${resp.connectionInfo.remoteAddress} failed with ${resp.statusCode} ${resp.reasonPhrase}");
  }
}

Future<T> makeGetRequest<T>(String url,
    [Map<String, String> headers = null]) async {
  HttpClientResponse resp =
      await makeRequest<Object>(Uri.parse(url), "GET", headers: headers);
  String responseBody = await UTF8.decodeStream(resp);

  ensureSuccessResponse(resp);

  return JSON.decode(responseBody) as T;
}

Future<T> makePostRequest<D, T>(String url, D body,
    [Map<String, String> headers = null]) async {
  HttpClientResponse resp =
      await makeRequest(Uri.parse(url), "POST", body: body, headers: headers);
  String responseBody = await UTF8.decodeStream(resp);

  ensureSuccessResponse(resp);

  return JSON.decode(responseBody) as T;
}

Future<Map<String, Object>> sendMessage(
    DateTime startDate, DateTime endDate, List<TallyTemplate> tally) async {
  final emailDomain = envVarRequired("SCI_TALLY_EMAIL_DOMAIN");
  final bool isLive =
      envVarDefault("SCI_TALLY_ENV", "development") == "production";
  final swuKey = envVarRequired("SCI_TALLY_SWU_KEY");
  final swuTemplateId = envVarRequired("SCI_TALLY_SWU_TEMPLATE_ID");
  final formatEmail = (String name) => "$name@$emailDomain";
  final SwuRecipient emailRecipient = isLive
      ? new SwuRecipient("Mike", formatEmail("mikef"))
      : new SwuRecipient("Joshua Harms", formatEmail("josh"));
  final List<SwuRecipient> ccs = isLive
      ? JSON.decode(envVarRequired("SCI_TALLY_CC_LIST")) as List<SwuRecipient>
      : [];
  final sender = new SwuSender("KMSignalR Superintendent",
      formatEmail("superintendent"), formatEmail("superintendent"));
  final headers = {
    "Authorization": BASE64.encode(UTF8.encode("$swuKey:")),
  };
  final message = new SwuMessage()
    ..template = swuTemplateId
    ..recipient = emailRecipient
    ..cc = ccs
    ..sender = sender
    ..template_data = (new SwuTallyTemplateData()
      ..date = new DateFormat("MMM dd, yyyy").format(startDate)
      ..tally = tally);

  log.info(god.serialize(message));

  return new Map<String, Object>();
}

Future main(List<String> args) async {
  Logger.root.level = Level.ALL;
  Logger.root.onRecord.listen((LogRecord rec) {
    print('[${rec.level.name}] ${rec.time}: ${rec.message}');
  });

  log.info("SCI Tally Tool starting up.");

  final endDate = getMidnight();
  final startDate = new DateTime(endDate.year, endDate.month, endDate.day - 7);
  final url = buildApiUrl(startDate, endDate);

  log.info("Getting tally from ${url}.");

  Map<String, int> tally = await makeGetRequest(url);
  Map<String, Object> emailResult = await sendMessage(startDate, endDate,
      tally.keys.map((key) => new TallyTemplate(key, tally[key])));
  tally.forEach((name, count) => log.info("$name: $count"));

  log.info(emailResult);

  // For some reason the vm will take 10+ seconds to exit when async is involved. Force it to exit quickly.
  exit(0);
}

class TallyTemplate {
  String source;
  int count;
  TallyTemplate(this.source, this.count);
}

class SwuRecipient {
  String name;
  String address;
  SwuRecipient(this.name, this.address);
}

class SwuSender extends SwuRecipient {
  String replyTo;
  SwuSender(String name, String address, this.replyTo) : super(name, address);
}

class SwuTallyTemplateData {
  String date;
  List<TallyTemplate> tally;
}

class SwuMessage {
  String template;
  SwuRecipient recipient;
  List<SwuRecipient> cc;
  SwuSender sender;
  SwuTallyTemplateData template_data;
}
