---
sidebar_position: 15
---

# Metrics

When you instantiate your store, you can optionally pass it a list of `stateObservers`
that you can use to collect metrics for your app:

```dart
var store = Store<AppState>(
  initialState: state,  
  stateObservers: [MetricsObserver()],
);
```

## StateObserver

The `StateObserver` is an abstract class with an `observe` method
which you can implement to be notified of any **state changes**:

```dart
abstract class StateObserver<St> {

   void observe(
     ReduxAction<St> action, 
     St stateIni, 
     St stateEnd, 
     Object? error,
     int dispatchCount,
   );
}
```

It will then be notified of all **state changes**, right after the reducer returns,
for all dispatched actions.

This notification happens before the `after()` method is called, and before the
action `wrapError()` and the global `globalWrapError()` methods are called.

The parameters are:

* `action`: The action itself.

* `prevState`: The state right before the new state returned by the reducer is applied. 
  Note this may be different from the state when the reducer was called.

* `newState`: The state returned by the reducer. If you need to know whether the state was
  changed or not by the reducer, you can compare both states:
  `bool ifStateChanged = !identical(prevState, newState);`

* `error`: Is `null` if the reducer completed with no error and returned. 
  Otherwise, it is the error thrown by the reducer (before any `wrapError` is applied). 
  In case of error, both `stateIni` and `stateEnd` will be the current store state when the error is thrown.

* `dispatchCount`: The sequential number of the dispatch.

This is an implementation idea. Here, we define a method called `trackEvent()` in the base
action class, which does nothing by default. Then, in the `MetricsObserver`, we call that method
for all actions. Finally, in a specific action, we override `trackEvent()` to actually
collect metrics.

```dart
 abstract class AppAction extends AppAction {
 
   void trackEvent(AppState stateIni, AppState stateEnd) { 
     // Do nothing 
   }
 }

 class MetricsObserver implements StateObserver<AppState> {
   
   void observe(
     ReduxAction<AppState> action,
     AppState prevState,
     AppState newState,
     Object? error,
     int dispatchCount,
   ) {
     if (action is AppAction) action.trackEvent(prevState, newState, error);
   }
 }

 class MyAction extends AppAction {
   
    AppState? reduce() { 
      // Do something 
      return state;
    }
   
    void trackEvent(AppState prevState, AppState newState, Object? error) =>
       MyMetrics().track(this, newState, error);
 }
```

## Printing actions to the console

Async Redux comes with a built-in `ConsoleActionObserver` class that you can use as
a state observer. It will print all actions to the console, in yellow, like this:

```dart
I/flutter (15304): | Action MyAction
```

This helps with development, so you probably don't want to use it in release mode:

```dart
var store = Store<AppState>(
   actionObservers: kReleaseMode ? null : [ConsoleActionObserver()],
);
```

If you implement method `toString()` of the action, you can display more information.
For example, suppose a `LoginAction` that has a `username` field:

```dart
class LoginAction extends ReduxAction {
  final String username;
  ...
  String toString() => super.toString() + '(username)';
}
```

The above code will print something like this:

```
I/flutter (15304): | Action MyLogin(user32)
```
