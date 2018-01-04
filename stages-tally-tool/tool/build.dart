#!/usr/bin/env dart --checked
import 'dart:async';
import "dart:io";
import "package:build_runner/build_runner.dart";
import "build_actions.dart";

Future main() async {
  var result = await build(buildActions, deleteFilesByDefault: true);

  if (result.status == BuildStatus.failure) {
    exitCode = 1;
  }
}
