library sci_tally_tool;

import "dart:async";
import "dart:io" show Platform;
import "dart:convert" show UTF8, BASE64, Encoding, JSON;
import "package:logging/logging.dart";
import "package:intl/intl.dart" show DateFormat;
import 'package:http/http.dart' as http;
import "package:dson/dson.dart";

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
  String env = envVarDefault("SCI_TALLY_ENV", "development");
  String qs = envVarDefault("Http_Query", "");

  return env == "production" || qs.contains("env=production");
}

DateTime getMidnight() {
  DateTime now = new DateTime.now();

  return new DateTime(now.year, now.month, now.day);
}

String buildApiUrl(DateTime startDate, DateTime endDate) {
  String apiDomain = envVarRequired("SCI_TALLY_API_DOMAIN");
  String protocol = apiDomain.contains("localhost") ? "http" : "https";

  return "$protocol://$apiDomain/api/v1/orders/tally/sources?since=${startDate.millisecondsSinceEpoch}&until=${endDate.millisecondsSinceEpoch}";
}

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

Future<T> makeGetRequest<T>(String url, [Map<String, String> headers = null]) async {
  var resp = await makeRequest(Uri.parse(url), "GET", customHeaders: headers);

  ensureSuccessResponse(resp);

  return JSON.decode(resp.body);
}

Future<T> makePostRequest<T>(String url, String body, [Map<String, String> headers = null]) async {
  http.Response resp = await makeRequest(Uri.parse(url), "POST", body: body, customHeaders: headers);

  ensureSuccessResponse(resp);

  return JSON.decode(resp.body);
}

SwuMessage buildEmailData(DateTime startDate, DateTime endDate, List<TallyTemplate> tally) {
  final isLive = envIsLive();
  final emailDomain = envVarRequired("SCI_TALLY_EMAIL_DOMAIN");
  final swuTemplateId = envVarRequired("SCI_TALLY_SWU_TEMPLATE_ID");
  final formatEmail = (String name) => "$name@$emailDomain";
  final SwuRecipient emailRecipient =
      isLive ? new SwuRecipient("Mike", formatEmail("mikef")) : new SwuRecipient("Joshua Harms", formatEmail("josh"));
  final List<SwuRecipient> ccs = isLive ? fromJson(envVarRequired("SCI_TALLY_CC_LIST"), [List, SwuRecipient]) : [];
  final sender =
      new SwuSender("KMSignalR Superintendent", formatEmail("superintendent"), formatEmail("superintendent"));

  return new SwuMessage()
    ..template = swuTemplateId
    ..recipient = emailRecipient
    ..cc = ccs
    ..sender = sender
    ..template_data = (new SwuTallyTemplateData()
      ..startDate = new DateFormat("MMM dd, yyyy").format(startDate)
      ..endDate = new DateFormat("MMM dd, yyyy").format(endDate)
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

  log.info("SCI Tally Tool starting up.");

  final endDate = getMidnight();
  final startDate = new DateTime(endDate.year, endDate.month, endDate.day - 7);
  final url = buildApiUrl(startDate, endDate);

  log.info("Getting tally from ${url}.");

  Iterable<TallyTemplate> tally = await makeGetRequest<Map<String, int>>(url)
      .then((map) => map.keys.map((key) => new TallyTemplate(key, map[key])));
  SwuMessage emailMessage = buildEmailData(startDate, endDate, tally);
  final swuKey = envVarRequired("SCI_TALLY_SWU_KEY");
  final headers = {
    "Authorization": "Basic ${BASE64.encode(UTF8.encode("$swuKey:"))}",
  };

  log.info("Sending to: ${emailMessage.recipient.address}");

  for (var cc in emailMessage.cc) {
    log.info("CCed to: ${cc.address}");
  }

  Map<String, Object> emailResult =
      await makePostRequest("https://api.sendwithus.com/api/v1/send", encode(emailMessage), headers);

  log.info("Send result: $emailResult");
}

@serializable
class TallyTemplate extends _$TallyTemplateSerializable {
  String source;
  int count;

  TallyTemplate(this.source, this.count);
}

@serializable
class SwuRecipient extends _$SwuRecipientSerializable {
  final String name;
  final String address;

  // SwuRecipient();
  SwuRecipient(this.name, this.address);
}

@serializable
class SwuSender extends _$SwuSenderSerializable {
  String name;
  String address;
  String replyTo;

  SwuSender(this.name, this.address, this.replyTo);
}

@serializable
class SwuTallyTemplateData extends _$SwuTallyTemplateDataSerializable {
  String startDate;
  String endDate;
  List<TallyTemplate> tally;

  SwuTallyTemplateData();
}

@serializable
class SwuMessage extends _$SwuMessageSerializable {
  String template;
  SwuRecipient recipient;
  List<SwuRecipient> cc;
  SwuSender sender;
  SwuTallyTemplateData template_data;

  SwuMessage();
}
