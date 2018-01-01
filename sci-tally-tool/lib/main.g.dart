// GENERATED CODE -- DO NOT MODIFY BY HAND
// ignore_for_file: always_declare_return_types

part of sci_tally_tool;

// **************************************************************************
// Generator: DsonGenerator
// **************************************************************************

abstract class _$TallyTemplateSerializable extends SerializableMap {
  String get source;
  int get count;
  void set source(String v);
  void set count(int v);

  operator [](Object __key) {
    switch (__key) {
      case 'source':
        return source;
      case 'count':
        return count;
    }
    throwFieldNotFoundException(__key, 'TallyTemplate');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'source':
        source = __value;
        return;
      case 'count':
        count = __value;
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
  String get startDate;
  String get endDate;
  List<TallyTemplate> get tally;
  void set startDate(String v);
  void set endDate(String v);
  void set tally(List<TallyTemplate> v);

  operator [](Object __key) {
    switch (__key) {
      case 'startDate':
        return startDate;
      case 'endDate':
        return endDate;
      case 'tally':
        return tally;
    }
    throwFieldNotFoundException(__key, 'SwuTallyTemplateData');
  }

  operator []=(Object __key, __value) {
    switch (__key) {
      case 'startDate':
        startDate = __value;
        return;
      case 'endDate':
        endDate = __value;
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

_TallyTemplate__Constructor([positionalParams, namedParams]) =>
    new TallyTemplate(positionalParams[0], positionalParams[1]);

const $$TallyTemplate_fields_source =
    const DeclarationMirror(name: 'source', type: String);
const $$TallyTemplate_fields_count =
    const DeclarationMirror(name: 'count', type: int);

const TallyTemplateClassMirror =
    const ClassMirror(name: 'TallyTemplate', constructors: const {
  '': const FunctionMirror(
      name: '',
      positionalParameters: const [
        const DeclarationMirror(name: 'source', type: String, isRequired: true),
        const DeclarationMirror(name: 'count', type: int, isRequired: true)
      ],
      $call: _TallyTemplate__Constructor)
}, fields: const {
  'source': $$TallyTemplate_fields_source,
  'count': $$TallyTemplate_fields_count
}, getters: const [
  'source',
  'count'
], setters: const [
  'source',
  'count'
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

const $$SwuTallyTemplateData_fields_startDate =
    const DeclarationMirror(name: 'startDate', type: String);
const $$SwuTallyTemplateData_fields_endDate =
    const DeclarationMirror(name: 'endDate', type: String);
const $$SwuTallyTemplateData_fields_tally =
    const DeclarationMirror(name: 'tally', type: const [List, TallyTemplate]);

const SwuTallyTemplateDataClassMirror =
    const ClassMirror(name: 'SwuTallyTemplateData', constructors: const {
  '': const FunctionMirror(name: '', $call: _SwuTallyTemplateData__Constructor)
}, fields: const {
  'startDate': $$SwuTallyTemplateData_fields_startDate,
  'endDate': $$SwuTallyTemplateData_fields_endDate,
  'tally': $$SwuTallyTemplateData_fields_tally
}, getters: const [
  'startDate',
  'endDate',
  'tally'
], setters: const [
  'startDate',
  'endDate',
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

// **************************************************************************
// Generator: InitMirrorsGenerator
// **************************************************************************

_initMirrors() {
  initClassMirrors({
    TallyTemplate: TallyTemplateClassMirror,
    SwuRecipient: SwuRecipientClassMirror,
    SwuSender: SwuSenderClassMirror,
    SwuTallyTemplateData: SwuTallyTemplateDataClassMirror,
    SwuMessage: SwuMessageClassMirror
  });
  initFunctionMirrors({});
}
