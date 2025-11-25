---
sidebar_position: 18
---

# Streams and Timers

To work with **streams** and **timers**, follow these guidelines:

* Don't send streams or timers down to widgets.
  Don't declare, subscribe, or unsubscribe to them inside widgets.

* Don't put streams or timers in the Redux store state.
  They produce state changes, but they are not state themselves.

## Example

Suppose you want to listen to username changes in Firestore.
Create one action to start listening, and another to cancel it. For example:
`StartListenUserNameAction` and `CancelListenUserNameAction`.

* If the stream or timer should run all the time,
  you can dispatch the start action as soon as the app launches,
  right after creating the store, possibly in `main`. Cancel it when the app finishes.

* If it should run only while a screen is open,
  dispatch the start action in the stateful widget's `initState` (or the `onInit` of a `StoreConnector`),
  and cancel it in `dispose` (or `onDispose` of a `StoreConnector`).

* If it should run only when some action requires it,
  the action's reducer can dispatch other actions to start and cancel it as needed.

While you should NOT store streams or timers in the state,
you *can* store them in the store "properties".
The `props` map can hold any objects, and reducers can access them. Example:

```dart
class StartTimer extends ReduxAction<AppState> {
  Future<AppState> reduce() async {
    setProp(
      'my timer',
      Timer.periodic(
        Duration(seconds: 1),
        (timer) => dispatch(DoSomethingAction(timer.tick)),
      ),
    );
    return null;
  }
}

class StopTimer extends ReduxAction<AppState> {
  Future<AppState> reduce() async {
    disposeProp('my timer');
    return null;
  }
}
```

Note that `disposeProp('my timer')` above is equivalent to:

```dart
var timer = prop<Timer?>('my timer');
if (timer != null) {
  timer.cancel();
  props.remove('my timer');
}
```

If the stream or timer should only be removed when the app shuts down,
call `store.disposeProps()` when the app finishes.
This will close, cancel, or ignore all stream-related objects, timers,
and futures in the props, and then remove them.

## How does a stream send data to the Redux state and then to widgets?

When creating the stream, define its callback to dispatch an action.
Each time new data arrives, pass it to the action constructor.
The reducer will store the data, and widgets observing that part of the state will update automatically.

Example:

```dart
Stream<QuerySnapshot> stream = query.snapshots();

streamSub = stream.listen(
  (QuerySnapshot querySnapshot) {
    dispatch(
      DoSomethingAction(querySnapshot.documentChanges)
    );
  },
  onError: ...,
);
```

## Summary

1. Put the stream or timer somewhere action reducers can access, such as in store _props_, but not in the state.
2. Never use streams or timers directly in widgets.
3. Create actions to start and cancel streams and timers, and call those actions when needed.
4. The stream or timer callback should dispatch actions to put incoming data into the Redux state.
