---
sidebar_position: 4
---

# Testing onInit / onDispose

Suppose you want to start polling information when your user enters a particular screen, and stop
when the user leaves it. This could be your `StoreConnector`:

```dart
class MyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) => StoreConnector<AppState, _Vm>(
        vm: () => _Factory(),
        onInit: _onInit,
        onDispose: _onDispose,
        builder: (context, vm) => MyWidget(...),
      );

  void _onInit(Store<AppState> store) => store.dispatch(PollInformationAction(true));
  void _onDispose(Store<AppState> store) => store.dispatch(PollInformationAction(false));
}
```

You want to test that `onInit` and `onDispose` above dispatch the correct action to start and stop
polling. You may achieve this by creating a widget test, entering and leaving the screen, and then
using the `StoreTester` to check that the actions were dispatched.

Instead, you may simply use the `ConnectorTester`, which you can access from the `StoreTester`:

```dart
var storeTester = StoreTester(...);
var connectorTester = storeTester.getConnectorTester(MyScreen());

connectorTester.runOnInit();
var info = await storeTester.waitUntil(PollInformationAction);
expect((info.action as PollInformationAction).start, true);

connectorTester.runOnDispose();
info = await storeTester.waitUntil(PollInformationAction);
expect((info.action as PollInformationAction).start, false);
```
