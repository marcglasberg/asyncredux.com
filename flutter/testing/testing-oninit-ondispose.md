---
sidebar_position: 4
---

# Testing onInit / onDispose

Suppose you want to start polling information when your user enters a particular screen,
and stop when the user leaves it. This could be your `StoreConnector`:

```dart
class MyScreen extends StatelessWidget {
  
  Widget build(BuildContext context) 
    => StoreConnector<AppState, _Vm>(
      vm: () => _Factory(),
      onInit: _onInit,
      onDispose: _onDispose,
      builder: (context, vm) => MyWidget(...),
    );

  void _onInit(Store<AppState> store) { 
    store.dispatch(PollInformationAction(true));
  }
    
  void _onDispose(Store<AppState> store) { 
    store.dispatch(PollInformationAction(false));
  }  
}
```

Now you want to test that `onInit` and `onDispose` above dispatch the correct action to start and
stop polling.

One way to achieve this could be creating a widget test,
entering and leaving the screen, and then checking that the actions were dispatched.

Instead, you may simply use the `ConnectorTester`, which you can access from the store:

```dart
var store = Store(...);
var connectorTester = store.getConnectorTester(MyScreen());

connectorTester.runOnInit();
var action = await store.waitAnyActionTypeFinishes([PollInformationAction]);
expect(action.start, true);

connectorTester.runOnDispose();
var action = await store.waitAnyActionTypeFinishes([PollInformationAction]);
expect(action.start, false);
```
