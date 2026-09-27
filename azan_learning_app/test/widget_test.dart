import 'package:azan_learning_app/src/app.dart';
import 'package:azan_learning_app/src/state/app_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('shows the Azan catalogue', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final controller = AppController();
    await controller.load();

    await tester.pumpWidget(AzanLearningApp(controller: controller));
    await tester.pumpAndSettle();

    expect(find.text('Azan Academy'), findsOneWidget);
    expect(find.text('Azan guide'), findsOneWidget);
    await tester.tap(find.text('Azan guide'));
    await tester.pumpAndSettle();
    expect(find.text('Mishari Irama Kurdi'), findsOneWidget);
    expect(find.text('Sheikh Mishari Irama Kurdi'), findsOneWidget);
    expect(find.text('Favorites'), findsNothing);
    expect(find.text('Fajr'), findsNothing);
    expect(find.text('Learn Azan'), findsOneWidget);
  });
}
