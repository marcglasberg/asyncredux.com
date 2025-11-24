---
sidebar_position: 18
---

# Streams and Timers

To deal with **streams** and **timers**, follow this advice:

- Don't send streams and timers down to the widgets.
  If you declare, subscribe to, or unsubscribe from streams inside widgets, 
  it means you are mixing Redux with some other architecture. 
  You _can_ do that, but it's not recommended and not necessary.

- Don't put streams and timers into the store state. They are not app state!
  Instead, they are something that "generates state changes".

## Example

Let's pretend you want to listen to changes to the user name, in a Firestore database.
First, create an action to start listening, and another action to cancel. We could name
them `StartListenUserNameAction` and `CancelListenUserNameAction`.

- If the stream/timer should run all the time, you may dispatch the start action as soon as the app
  starts, right after you create the store, possibly in `main`. And cancel it when the app finishes.

- If the stream/timer should run only when the user is viewing some screen, you may dispatch the
  action from the `initState` method of the screen widget (or `onInit` param of a `StoreConnector`), 
  and cancel it from the `dispose` method of the screen widget (or `onDispose` param of a `StoreConnector`).

- If the stream/timer should run only when some action demands it, the action reducer may dispatch
  some other action to start and cancel them as needed.

While you should NOT put streams/timers in the store state, you can put them in the
store "properties". The `props` are a map that you can use to store any object you want,
and they are accessible from the reducers. Example:

```dart
class StartTimer extends ReduxAction<AppState> {

  Future<AppState> reduce() async {

    setProp(
      'my timer', 
      Timer.periodic(
        Duration(seconds: 1), 
        (timer) { dispatch(DoSomethingAction(timer.tick)); }
      )
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

If your stream/timer should only be removed when the app shuts down, you can
call `store.disposeProps()` when the app finishes. This will automatically close/cancel/ignore
all stream related objects, timers and futures in the props, and then also remove them from there.

## How do streams pass their information down to the store and ultimately to the widgets?

When you create the stream, define its callback so that it dispatches an appropriate action. Each
time the stream gets some data it will pass it to the action constructor. The action reducer
will put the data into the store state, from where it will be automatically sent down to the widgets
that observe them.

For example:

```dart
Stream<QuerySnapshot> stream = query.snapshots();

streamSub = stream.listen((QuerySnapshot querySnapshot) {
  dispatch(DoSomethingAction(querySnapshot.documentChanges));
  }, onError: ...);
```

## To sum up

1. Put your stream/timer where it can be accessed by the reducers, such as in the store
   props or any other suitable place, but NOT inside the store state.

2. Don't use streams or timers directly in widgets.

3. Create actions to start and cancel streams and timers, and call them when necessary.

4. The stream/timer callback should dispatch actions to put the snapshot data into the Redux state.
