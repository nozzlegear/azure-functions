library stages_tally_tool;

import "package:dson/dson.dart";

part "domain.g.dart";

enum Endpoint { Financials, Subscribers, SubscriberCount }

/// A sanitized version of a Stages account. Does not include personal user information or sensitive data.
@serializable
class Subscriber extends _$SubscriberSerializable {
  num Id;
  SubscriberPlan Plan;
  String AccountOwner;
  bool IsSubscribed;
  DateTime DateCreated;
  DateTime NextChargeDate;
  String ReasonForCancellation;
  String ShopifyShopName;
  String ShopifyShopDomain;
}

/// A Stages subscription plan.
@serializable
class SubscriberPlan extends _$SubscriberPlanSerializable {
  String Id;
  String StripeId;
  String Name;
  num ValueInCents;
  String Value;
  num MemberLimit;
}

@serializable
class CountResult extends _$CountResultSerializable {
  num count;
}

@serializable
class TallyResponse extends _$TallyResponseSerializable {
  num since;
  Map<String, int> summary;
}

@serializable
class TallyTemplate extends _$TallyTemplateSerializable {
  num totalActiveSubscribers;
  num totalMonthlyValue;

  TallyTemplate(this.totalActiveSubscribers, this.totalMonthlyValue);
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
  String date;
  TallyTemplate tally;

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
