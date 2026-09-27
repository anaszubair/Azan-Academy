import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'src/app.dart';
import 'src/state/app_controller.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final controller = AppController();
  runApp(AzanLearningApp(controller: controller));
  SchedulerBinding.instance.addPostFrameCallback((_) {
    unawaited(controller.load());
  });
}
