import "package:build_runner/build_runner.dart";
import "package:dson/action.dart";

// NOTICE: Before you decide to build your own Builder/BuildAction, understand that BuildActions are *not* allowed to generate
// the same files as a previous build action. So if dsonAction generates main.g.dart, your custom buildaction cannot also
// output main.g.dart. Use a pub transformer for this instead, or use build_barback to build a transformer + builder combo.
const String header = """// GENERATED CODE -- DO NOT MODIFY BY HAND
// ignore_for_file: always_declare_return_types


""";

List<BuildAction> get buildActions => [
      dsonAction(const ["lib/*.dart"], header),
    ];
