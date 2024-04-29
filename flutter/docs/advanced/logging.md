---
sidebar_position: 13
---

# Logging

Your store optionally accepts lists of `actionObservers` and `stateObservers`, which may be used for
logging:

```dart
var store = Store<AppState>(
  initialState: state,
  actionObservers: [Log.printer(formatter: Log.verySimpleFormatter)],
  stateObservers: [StateLogger()],
);
```

The `ActionObserver` is an abstract class with an `observe` method which you can implement to be
notified of **action dispatching**:

```dart
abstract class ActionObserver<St> {

   void observe(
      ReduxAction<St> action, 
      int dispatchCount, {
      required bool ini,
      }
   );
}
```

The above observer will actually be called twice, one with `ini==true` for the INITIAL action
observation, and one with `ini==false` for the END action observation,

In more detail:

1. The INI action observation means the action was just dispatched and haven't changed anything yet.
   After that, it may do sync stuff, and it may or may not start async processes, depending on its
   reducer being sync or async.

2. The END action observation means the action reducer has just finished returning a new state, thus
   changing the store state. Only after getting END states you may see store changes.

3. The state observation is therefore called as soon as possible after the store change has taken
   place, i.e., right after the END action observation. However, it contains a copy of both the
   state **before the action INI** and the state **after the action END**, in case you need to
   compare them.

Please note, unless the action reducer is synchronous, getting an END action observation doesn't
mean that all the action effects have finished, because the action may have started async
processes that may well last into the future. And these processes may later dispatch other actions
that will change the store state. However, it does mean that the action can no longer change the
state **directly**.

Meanwhile, the `StateObserver` is an abstract class which you can implement to be notified of
**state changes**. This observer can be used for logging, but it can also be used for metrics.
