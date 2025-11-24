---
sidebar_position: 14
---

# Logging

When you instantiate your store, you can optionally pass it a list of `actionObservers` and
a list of `stateObservers`, which may both be used for logging:

```dart
var store = Store<AppState>(
  initialState: state,
  actionObservers: [Log.printer(formatter: Log.verySimpleFormatter)],
  stateObservers: [StateLogger()],
);
```
     
## ActionObserver

The `ActionObserver` is an abstract class with an `observe` method 
which you can implement to be notified of any **action dispatching**:

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

The above observer will actually be called twice, one with `ini: true` for the INITIAL action
observation, and one with `ini: false` for the END action observation.

In more detail:

1. The INI action observation means the action was just dispatched and hasn't changed anything yet.
   After that, it may do sync stuff, and it may or may not start async processes, depending on its
   reducer being sync or async.

2. The END action observation means the action reducer has just finished returning a new state, 
   and changing the store state. Only after getting END states you may see state changes.

3. The state observation is therefore called as soon as possible after the store change has taken
   place, i.e., right after the END action observation. However, it contains a copy of both the
   state **before the action INI** and the state **after the action END**, in case you need to
   compare them.

Please note that if the action reducer is not synchronous, 
receiving an END action observation does not guarantee that all effects of the action have finished. 
The action may have started unawaited async processes that can continue running 
and may later dispatch other actions that change the store state. 
What it does guarantee is that the action itself can no longer change the state **directly**.
                
## StateObserver

The `StateObserver` can also be used for logging.

However, since its main goal is to implement collecting metrics,
let's discuss it in the [Metrics](./metrics) page.
