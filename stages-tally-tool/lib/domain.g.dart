// GENERATED CODE -- DO NOT MODIFY BY HAND
// ignore_for_file: always_declare_return_types

part of stages_tally_tool;

// **************************************************************************
// Generator: DsonGenerator
// **************************************************************************

abstract class _$SubscriberSerializable extends SerializableMap {
  num get Id;
  SubscriberPlan get Plan;
  String get AccountOwner;
  bool get IsSubscribed;
  DateTime get DateCreated;
  DateTime get NextChargeDate;
  String get ReasonForCancellation;
  String get ShopifyShopName;
  String get ShopifyShopDomain;
  void set Id(num v);
  void set Plan(SubscriberPlan v);
  void set AccountOwner(String v);
  void set IsSubscribed(bool v);
  void set DateCreated(DateTime v);
  void set NextChargeDate(DateTime v);
  void set ReasonForCancellation(String v);
  void set ShopifyShopName(String v);
  void set ShopifyShopDomain(String v);

  operator [](Object __key) {
    switch (__key) {
      case 'Id':
        return Id;
      case 'Plan':
        return Plan;
      case 'AccountOwner':
        return AccountOwner;
      case 'IsSubscribed':
        return IsSubscribed;
      case 'DateCreated':
        return DateCreated;
      case 'NextChargeDate':
        return NextChargeDate;
      case 'ReasonForCancellation':
        return ReasonForCancellation;
      case 'ShopifyShopName':
        return ShopifyShopName;
      case 'ShopifyShopDomain':
        return ShopifyShopDomain;
    }
    throwFieldNotFoundException(__key, 'Subscriber');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'Id':
        Id = __value;
        return;
      case 'Plan':
        Plan = __value;
        return;
      case 'AccountOwner':
        AccountOwner = __value;
        return;
      case 'IsSubscribed':
        IsSubscribed = __value;
        return;
      case 'DateCreated':
        DateCreated = __value;
        return;
      case 'NextChargeDate':
        NextChargeDate = __value;
        return;
      case 'ReasonForCancellation':
        ReasonForCancellation = __value;
        return;
      case 'ShopifyShopName':
        ShopifyShopName = __value;
        return;
      case 'ShopifyShopDomain':
        ShopifyShopDomain = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'Subscriber');
  }

  Iterable<String> get keys => SubscriberClassMirror.fields.keys;
}

abstract class _$SubscriberPlanSerializable extends SerializableMap {
  String get Id;
  String get StripeId;
  String get Name;
  num get ValueInCents;
  String get Value;
  num get MemberLimit;
  void set Id(String v);
  void set StripeId(String v);
  void set Name(String v);
  void set ValueInCents(num v);
  void set Value(String v);
  void set MemberLimit(num v);

  operator [](Object __key) {
    switch (__key) {
      case 'Id':
        return Id;
      case 'StripeId':
        return StripeId;
      case 'Name':
        return Name;
      case 'ValueInCents':
        return ValueInCents;
      case 'Value':
        return Value;
      case 'MemberLimit':
        return MemberLimit;
    }
    throwFieldNotFoundException(__key, 'SubscriberPlan');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'Id':
        Id = __value;
        return;
      case 'StripeId':
        StripeId = __value;
        return;
      case 'Name':
        Name = __value;
        return;
      case 'ValueInCents':
        ValueInCents = __value;
        return;
      case 'Value':
        Value = __value;
        return;
      case 'MemberLimit':
        MemberLimit = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'SubscriberPlan');
  }

  Iterable<String> get keys => SubscriberPlanClassMirror.fields.keys;
}

abstract class _$CountResultSerializable extends SerializableMap {
  num get count;
  void set count(num v);

  operator [](Object __key) {
    switch (__key) {
      case 'count':
        return count;
    }
    throwFieldNotFoundException(__key, 'CountResult');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'count':
        count = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'CountResult');
  }

  Iterable<String> get keys => CountResultClassMirror.fields.keys;
}

abstract class _$TallyResponseSerializable extends SerializableMap {
  num get since;
  Map<String, int> get summary;
  void set since(num v);
  void set summary(Map<String, int> v);

  operator [](Object __key) {
    switch (__key) {
      case 'since':
        return since;
      case 'summary':
        return summary;
    }
    throwFieldNotFoundException(__key, 'TallyResponse');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'since':
        since = __value;
        return;
      case 'summary':
        summary = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'TallyResponse');
  }

  Iterable<String> get keys => TallyResponseClassMirror.fields.keys;
}

abstract class _$TallyTemplateSerializable extends SerializableMap {
  num get totalActiveSubscribers;
  num get totalMonthlyValue;
  void set totalActiveSubscribers(num v);
  void set totalMonthlyValue(num v);

  operator [](Object __key) {
    switch (__key) {
      case 'totalActiveSubscribers':
        return totalActiveSubscribers;
      case 'totalMonthlyValue':
        return totalMonthlyValue;
    }
    throwFieldNotFoundException(__key, 'TallyTemplate');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'totalActiveSubscribers':
        totalActiveSubscribers = __value;
        return;
      case 'totalMonthlyValue':
        totalMonthlyValue = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'TallyTemplate');
  }

  Iterable<String> get keys => TallyTemplateClassMirror.fields.keys;
}

abstract class _$SwuRecipientSerializable extends SerializableMap {
  String get name;
  String get address;

  operator [](Object __key) {
    switch (__key) {
      case 'name':
        return name;
      case 'address':
        return address;
    }
    throwFieldNotFoundException(__key, 'SwuRecipient');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
    }
    throwFieldNotFoundException(__key, 'SwuRecipient');
  }

  Iterable<String> get keys => SwuRecipientClassMirror.fields.keys;
}

abstract class _$SwuSenderSerializable extends SerializableMap {
  String get name;
  String get address;
  String get replyTo;
  void set name(String v);
  void set address(String v);
  void set replyTo(String v);

  operator [](Object __key) {
    switch (__key) {
      case 'name':
        return name;
      case 'address':
        return address;
      case 'replyTo':
        return replyTo;
    }
    throwFieldNotFoundException(__key, 'SwuSender');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'name':
        name = __value;
        return;
      case 'address':
        address = __value;
        return;
      case 'replyTo':
        replyTo = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'SwuSender');
  }

  Iterable<String> get keys => SwuSenderClassMirror.fields.keys;
}

abstract class _$SwuTallyTemplateDataSerializable extends SerializableMap {
  String get date;
  TallyTemplate get tally;
  void set date(String v);
  void set tally(TallyTemplate v);

  operator [](Object __key) {
    switch (__key) {
      case 'date':
        return date;
      case 'tally':
        return tally;
    }
    throwFieldNotFoundException(__key, 'SwuTallyTemplateData');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'date':
        date = __value;
        return;
      case 'tally':
        tally = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'SwuTallyTemplateData');
  }

  Iterable<String> get keys => SwuTallyTemplateDataClassMirror.fields.keys;
}

abstract class _$SwuMessageSerializable extends SerializableMap {
  String get template;
  SwuRecipient get recipient;
  List<SwuRecipient> get cc;
  SwuSender get sender;
  SwuTallyTemplateData get template_data;
  void set template(String v);
  void set recipient(SwuRecipient v);
  void set cc(List<SwuRecipient> v);
  void set sender(SwuSender v);
  void set template_data(SwuTallyTemplateData v);

  operator [](Object __key) {
    switch (__key) {
      case 'template':
        return template;
      case 'recipient':
        return recipient;
      case 'cc':
        return cc;
      case 'sender':
        return sender;
      case 'template_data':
        return template_data;
    }
    throwFieldNotFoundException(__key, 'SwuMessage');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'template':
        template = __value;
        return;
      case 'recipient':
        recipient = __value;
        return;
      case 'cc':
        cc = __value;
        return;
      case 'sender':
        sender = __value;
        return;
      case 'template_data':
        template_data = __value;
        return;
    }
    throwFieldNotFoundException(__key, 'SwuMessage');
  }

  Iterable<String> get keys => SwuMessageClassMirror.fields.keys;
}

// **************************************************************************
// Generator: MirrorsGenerator
// **************************************************************************

_Subscriber__Constructor([positionalParams, namedParams]) => new Subscriber();

const $$Subscriber_fields_Id = const DeclarationMirror(name: 'Id', type: num);
const $$Subscriber_fields_Plan =
    const DeclarationMirror(name: 'Plan', type: SubscriberPlan);
const $$Subscriber_fields_AccountOwner =
    const DeclarationMirror(name: 'AccountOwner', type: String);
const $$Subscriber_fields_IsSubscribed =
    const DeclarationMirror(name: 'IsSubscribed', type: bool);
const $$Subscriber_fields_DateCreated =
    const DeclarationMirror(name: 'DateCreated', type: DateTime);
const $$Subscriber_fields_NextChargeDate =
    const DeclarationMirror(name: 'NextChargeDate', type: DateTime);
const $$Subscriber_fields_ReasonForCancellation =
    const DeclarationMirror(name: 'ReasonForCancellation', type: String);
const $$Subscriber_fields_ShopifyShopName =
    const DeclarationMirror(name: 'ShopifyShopName', type: String);
const $$Subscriber_fields_ShopifyShopDomain =
    const DeclarationMirror(name: 'ShopifyShopDomain', type: String);

const SubscriberClassMirror =
    const ClassMirror(name: 'Subscriber', constructors: const {
  '': const FunctionMirror(name: '', $call: _Subscriber__Constructor)
}, fields: const {
  'Id': $$Subscriber_fields_Id,
  'Plan': $$Subscriber_fields_Plan,
  'AccountOwner': $$Subscriber_fields_AccountOwner,
  'IsSubscribed': $$Subscriber_fields_IsSubscribed,
  'DateCreated': $$Subscriber_fields_DateCreated,
  'NextChargeDate': $$Subscriber_fields_NextChargeDate,
  'ReasonForCancellation': $$Subscriber_fields_ReasonForCancellation,
  'ShopifyShopName': $$Subscriber_fields_ShopifyShopName,
  'ShopifyShopDomain': $$Subscriber_fields_ShopifyShopDomain
}, getters: const [
  'Id',
  'Plan',
  'AccountOwner',
  'IsSubscribed',
  'DateCreated',
  'NextChargeDate',
  'ReasonForCancellation',
  'ShopifyShopName',
  'ShopifyShopDomain'
], setters: const [
  'Id',
  'Plan',
  'AccountOwner',
  'IsSubscribed',
  'DateCreated',
  'NextChargeDate',
  'ReasonForCancellation',
  'ShopifyShopName',
  'ShopifyShopDomain'
]);
_SubscriberPlan__Constructor([positionalParams, namedParams]) =>
    new SubscriberPlan();

const $$SubscriberPlan_fields_Id =
    const DeclarationMirror(name: 'Id', type: String);
const $$SubscriberPlan_fields_StripeId =
    const DeclarationMirror(name: 'StripeId', type: String);
const $$SubscriberPlan_fields_Name =
    const DeclarationMirror(name: 'Name', type: String);
const $$SubscriberPlan_fields_ValueInCents =
    const DeclarationMirror(name: 'ValueInCents', type: num);
const $$SubscriberPlan_fields_Value =
    const DeclarationMirror(name: 'Value', type: String);
const $$SubscriberPlan_fields_MemberLimit =
    const DeclarationMirror(name: 'MemberLimit', type: num);

const SubscriberPlanClassMirror =
    const ClassMirror(name: 'SubscriberPlan', constructors: const {
  '': const FunctionMirror(name: '', $call: _SubscriberPlan__Constructor)
}, fields: const {
  'Id': $$SubscriberPlan_fields_Id,
  'StripeId': $$SubscriberPlan_fields_StripeId,
  'Name': $$SubscriberPlan_fields_Name,
  'ValueInCents': $$SubscriberPlan_fields_ValueInCents,
  'Value': $$SubscriberPlan_fields_Value,
  'MemberLimit': $$SubscriberPlan_fields_MemberLimit
}, getters: const [
  'Id',
  'StripeId',
  'Name',
  'ValueInCents',
  'Value',
  'MemberLimit'
], setters: const [
  'Id',
  'StripeId',
  'Name',
  'ValueInCents',
  'Value',
  'MemberLimit'
]);
_CountResult__Constructor([positionalParams, namedParams]) => new CountResult();

const $$CountResult_fields_count =
    const DeclarationMirror(name: 'count', type: num);

const CountResultClassMirror = const ClassMirror(
    name: 'CountResult',
    constructors: const {
      '': const FunctionMirror(name: '', $call: _CountResult__Constructor)
    },
    fields: const {
      'count': $$CountResult_fields_count
    },
    getters: const [
      'count'
    ],
    setters: const [
      'count'
    ]);
_TallyResponse__Constructor([positionalParams, namedParams]) =>
    new TallyResponse();

const $$TallyResponse_fields_since =
    const DeclarationMirror(name: 'since', type: num);
const $$TallyResponse_fields_summary =
    const DeclarationMirror(name: 'summary', type: const [
  Map,
  const [String, int]
]);

const TallyResponseClassMirror = const ClassMirror(
    name: 'TallyResponse',
    constructors: const {
      '': const FunctionMirror(name: '', $call: _TallyResponse__Constructor)
    },
    fields: const {
      'since': $$TallyResponse_fields_since,
      'summary': $$TallyResponse_fields_summary
    },
    getters: const [
      'since',
      'summary'
    ],
    setters: const [
      'since',
      'summary'
    ]);
_TallyTemplate__Constructor([positionalParams, namedParams]) =>
    new TallyTemplate(positionalParams[0], positionalParams[1]);

const $$TallyTemplate_fields_totalActiveSubscribers =
    const DeclarationMirror(name: 'totalActiveSubscribers', type: num);
const $$TallyTemplate_fields_totalMonthlyValue =
    const DeclarationMirror(name: 'totalMonthlyValue', type: num);

const TallyTemplateClassMirror =
    const ClassMirror(name: 'TallyTemplate', constructors: const {
  '': const FunctionMirror(
      name: '',
      positionalParameters: const [
        const DeclarationMirror(
            name: 'totalActiveSubscribers', type: num, isRequired: true),
        const DeclarationMirror(
            name: 'totalMonthlyValue', type: num, isRequired: true)
      ],
      $call: _TallyTemplate__Constructor)
}, fields: const {
  'totalActiveSubscribers': $$TallyTemplate_fields_totalActiveSubscribers,
  'totalMonthlyValue': $$TallyTemplate_fields_totalMonthlyValue
}, getters: const [
  'totalActiveSubscribers',
  'totalMonthlyValue'
], setters: const [
  'totalActiveSubscribers',
  'totalMonthlyValue'
]);
_SwuRecipient__Constructor([positionalParams, namedParams]) =>
    new SwuRecipient(positionalParams[0], positionalParams[1]);

const $$SwuRecipient_fields_name =
    const DeclarationMirror(name: 'name', type: String, isFinal: true);
const $$SwuRecipient_fields_address =
    const DeclarationMirror(name: 'address', type: String, isFinal: true);

const SwuRecipientClassMirror =
    const ClassMirror(name: 'SwuRecipient', constructors: const {
  '': const FunctionMirror(
      name: '',
      positionalParameters: const [
        const DeclarationMirror(name: 'name', type: String, isRequired: true),
        const DeclarationMirror(name: 'address', type: String, isRequired: true)
      ],
      $call: _SwuRecipient__Constructor)
}, fields: const {
  'name': $$SwuRecipient_fields_name,
  'address': $$SwuRecipient_fields_address
}, getters: const [
  'name',
  'address'
]);
_SwuSender__Constructor([positionalParams, namedParams]) => new SwuSender(
    positionalParams[0], positionalParams[1], positionalParams[2]);

const $$SwuSender_fields_name =
    const DeclarationMirror(name: 'name', type: String);
const $$SwuSender_fields_address =
    const DeclarationMirror(name: 'address', type: String);
const $$SwuSender_fields_replyTo =
    const DeclarationMirror(name: 'replyTo', type: String);

const SwuSenderClassMirror =
    const ClassMirror(name: 'SwuSender', constructors: const {
  '': const FunctionMirror(
      name: '',
      positionalParameters: const [
        const DeclarationMirror(name: 'name', type: String, isRequired: true),
        const DeclarationMirror(
            name: 'address', type: String, isRequired: true),
        const DeclarationMirror(name: 'replyTo', type: String, isRequired: true)
      ],
      $call: _SwuSender__Constructor)
}, fields: const {
  'name': $$SwuSender_fields_name,
  'address': $$SwuSender_fields_address,
  'replyTo': $$SwuSender_fields_replyTo
}, getters: const [
  'name',
  'address',
  'replyTo'
], setters: const [
  'name',
  'address',
  'replyTo'
]);
_SwuTallyTemplateData__Constructor([positionalParams, namedParams]) =>
    new SwuTallyTemplateData();

const $$SwuTallyTemplateData_fields_date =
    const DeclarationMirror(name: 'date', type: String);
const $$SwuTallyTemplateData_fields_tally =
    const DeclarationMirror(name: 'tally', type: TallyTemplate);

const SwuTallyTemplateDataClassMirror =
    const ClassMirror(name: 'SwuTallyTemplateData', constructors: const {
  '': const FunctionMirror(name: '', $call: _SwuTallyTemplateData__Constructor)
}, fields: const {
  'date': $$SwuTallyTemplateData_fields_date,
  'tally': $$SwuTallyTemplateData_fields_tally
}, getters: const [
  'date',
  'tally'
], setters: const [
  'date',
  'tally'
]);
_SwuMessage__Constructor([positionalParams, namedParams]) => new SwuMessage();

const $$SwuMessage_fields_template =
    const DeclarationMirror(name: 'template', type: String);
const $$SwuMessage_fields_recipient =
    const DeclarationMirror(name: 'recipient', type: SwuRecipient);
const $$SwuMessage_fields_cc =
    const DeclarationMirror(name: 'cc', type: const [List, SwuRecipient]);
const $$SwuMessage_fields_sender =
    const DeclarationMirror(name: 'sender', type: SwuSender);
const $$SwuMessage_fields_template_data =
    const DeclarationMirror(name: 'template_data', type: SwuTallyTemplateData);

const SwuMessageClassMirror =
    const ClassMirror(name: 'SwuMessage', constructors: const {
  '': const FunctionMirror(name: '', $call: _SwuMessage__Constructor)
}, fields: const {
  'template': $$SwuMessage_fields_template,
  'recipient': $$SwuMessage_fields_recipient,
  'cc': $$SwuMessage_fields_cc,
  'sender': $$SwuMessage_fields_sender,
  'template_data': $$SwuMessage_fields_template_data
}, getters: const [
  'template',
  'recipient',
  'cc',
  'sender',
  'template_data'
], setters: const [
  'template',
  'recipient',
  'cc',
  'sender',
  'template_data'
]);
