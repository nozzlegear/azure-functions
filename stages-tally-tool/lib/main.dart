library stages_tally_tool;

import "dart:async";
import "dart:io" show Platform;
import "dart:convert" show UTF8, BASE64, Encoding, JSON;
import "package:logging/logging.dart";
import "package:intl/intl.dart" show DateFormat;
import 'package:http/http.dart' as http;
import "package:tuple/tuple.dart";
import "package:dson/dson.dart";
import "domain.dart";

part "main.g.dart";

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

bool envIsLive() {
  String env = envVarDefault("STAGES_TALLY_ENV", "development");
  String qs = envVarDefault("Http_Query", "");

  return env == "production" || qs.contains("env=production");
}

DateTime getMidnight() {
  DateTime now = new DateTime.now();

  return new DateTime(now.year, now.month, now.day);
}

String buildApiUrl(Endpoint ep) {
  String apiDomain = envVarRequired("STAGES_TALLY_API_DOMAIN");
  String protocol = apiDomain.contains("localhost") ? "http" : "https";
  String path;

  switch (ep) {
    case Endpoint.Financials:
      path = "financials";
      break;

    case Endpoint.Subscribers:
      path = "subscribers";
      break;

    case Endpoint.SubscriberCount:
      path = "subscribers/count";
      break;
  }

  return "$protocol://$apiDomain/api/admin/$path";
}

String buildFinancialsApiUrl() => buildApiUrl(Endpoint.Financials);

String buildSubscriberCountApiUrl() => "${buildApiUrl(Endpoint.SubscriberCount)}?status=subscribed";

Map<String, String> buildStagesHeaders(String authToken) =>
    {"X-Stages-Access-Token": authToken, "X-Stages-API-Version": "1"};

Future<http.Response> makeRequest(Uri url, String method,
    {String body = null, Map<String, String> customHeaders = null}) async {
  customHeaders ??= {};

  Map<String, String> headers = new Map.from(customHeaders)
    ..putIfAbsent("Content-Type", () => "application/json")
    ..putIfAbsent("Accept", () => "application/json");
  http.Response resp;

  switch (method.toLowerCase()) {
    case "post":
      resp = await http.post(url, body: body, encoding: Encoding.getByName("UTF8"), headers: headers);
      break;
    case "get":
      resp = await http.get(url, headers: headers);
      break;
    default:
      throw new UnimplementedError("Attempted to create HttpClient with unsupported HTTP method $method.");
  }

  return resp;
}

void ensureSuccessResponse(http.Response resp) {
  if (resp.statusCode < 200 || resp.statusCode >= 300) {
    String message = "Request to ${resp.request.url} failed with ${resp.statusCode} ${resp.reasonPhrase}.";

    log.severe("$message Response body: ${resp.body}");

    throw new StateError(message);
  }
}

Future<String> makeGetRequest(String url, [Map<String, String> headers = null]) async {
  var resp = await makeRequest(Uri.parse(url), "GET", customHeaders: headers);

  ensureSuccessResponse(resp);

  return resp.body;
}

Future<String> makePostRequest(String url, String body, [Map<String, String> headers = null]) async {
  http.Response resp = await makeRequest(Uri.parse(url), "POST", body: body, customHeaders: headers);

  ensureSuccessResponse(resp);

  return resp.body;
}

SwuMessage buildEmailData(DateTime startDate, TallyTemplate tally) {
  final emailDomain = envVarRequired("STAGES_TALLY_EMAIL_DOMAIN");
  final swuTemplateId = envVarRequired("STAGES_TALLY_SWU_TEMPLATE_ID");
  final SwuRecipient emailRecipient = new SwuRecipient("Joshua Harms", "joshua@$emailDomain");
  final sender = new SwuSender("Superintendent", "superintendent@$emailDomain", "superintendent@$emailDomain");

  return new SwuMessage()
    ..template = swuTemplateId
    ..recipient = emailRecipient
    ..cc = []
    ..sender = sender
    ..template_data = (new SwuTallyTemplateData()
      ..date = new DateFormat("MMM dd, yyyy").format(startDate)
      ..tally = tally);
}

String encode(Object data) {
  dynamic toEncodable(arg) {
    if (arg is Iterable) {
      // JSON codec doesn't know how to encode iterable, but it does know how to encode List.
      // Still doesn't answer the question of why a List<Map> registers as Iterable rather than
      // a List in the first place.
      return arg.toList();
    }

    // This will throw an exception if the object doesn't implement toJson. An exception will be thrown
    // anyway as the codec won't know how to encode it.
    return arg.toJson();
  }

  return JSON.encode(data, toEncodable: toEncodable);
}

Future main(List<String> args) async {
  _initMirrors();
  Logger.root.level = Level.ALL;
  Logger.root.onRecord.listen((LogRecord rec) {
    print('[${rec.level.name}] ${rec.time}: ${rec.message}');
  });

  log.info("Stages Tally Tool starting up.");

  final endDate = getMidnight();
  final startDate = new DateTime(endDate.year, endDate.month, endDate.day - 1);
  final apiKey = envVarRequired("STAGES_TALLY_API_KEY");
  final stagesHeaders = buildStagesHeaders(apiKey);
  final financialsUrl = buildFinancialsApiUrl();
  final countUrl = buildSubscriberCountApiUrl();
  final swuKey = envVarRequired("STAGES_TALLY_SWU_KEY");
  final swuHeaders = {
    "Authorization": "Basic ${BASE64.encode(UTF8.encode("$swuKey:"))}",
  };

  log.info("Getting data from $financialsUrl and $countUrl.");

  SwuMessage emailMessage = await Future.wait([
    makeGetRequest(financialsUrl, stagesHeaders)
        .then((s) => fromJson(s, [List, SubscriberPlan]) as List<SubscriberPlan>),
    makeGetRequest(countUrl, stagesHeaders).then((s) => fromJson(s, [CountResult]) as CountResult)
  ]).then((results) {
    List<SubscriberPlan> plans = results.singleWhere((x) => x is List<SubscriberPlan>);
    CountResult subscriberCount = results.singleWhere((x) => x is CountResult);
    num totalValue = plans.fold(0, (int total, plan) => total + plan.ValueInCents) / 100;

    return buildEmailData(startDate, new TallyTemplate(subscriberCount.count, totalValue));
  });

  log.info("Sending to: ${emailMessage.recipient.address}");

  for (var cc in emailMessage.cc) {
    log.info("CCed to: ${cc.address}");
  }

  String emailResult =
      await makePostRequest("https://api.sendwithus.com/api/v1/send", encode(emailMessage), swuHeaders);

  log.info("Send result: $emailResult");
}
