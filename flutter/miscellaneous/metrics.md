---
sidebar_position: 14
---

# Metrics

When you instantiate your store, you can optionally pass it a list of `stateObservers`, 
which may be used for collecting metrics for your app:

```dart
var store = Store<AppState>(
  initialState: state,  
  stateObservers: [MetricsObserver()],
);
```

This is the `StateObserver` definition:

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

For example, you may create a `MetricsObserver` class, which extends `StateObserver`.
It will then be notified of all **state changes**, right after the reducer returns,
resulting from all dispatched actions.

That notification happens before the
`after()` method is called, and before the action's `wrapError()` and the
global `globalWrapError()` methods are called.

The parameters are:

* `action` = The action itself.

* `prevState` = The state right before the new state returned by the reducer is applied. Note this
  may be different from the state when the reducer was called.

* `newState` = The state returned by the reducer. Note: If you need to know if the state was
  changed or not by the reducer, you can compare both states:
  `bool ifStateChanged = !identical(prevState, newState);`

* `error` = Is `null` if the reducer completed with no error and returned. Otherwise, will be the
  error thrown by the reducer (before any `wrapError` is applied). Note that, in case of
  error, both `prevState` and `newState` will be the current store state when the error is
  thrown.

* `dispatchCount` = The sequential number of the dispatch.

This is an implementation example:

```dart
 abstract class AppAction extends ReduxAction<AppState> {
   void trackEvent(AppState stateIni, AppState stateEnd) { // Don't to anything }
 }

 class AppStateObserver implements StateObserver<AppState> {
   
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
   
    AppState? reduce() { // Do something }
   
    void trackEvent(AppState prevState, AppState newState, Object? error) =>
       MyMetrics().track(this, newState, error);
 }
```

## Printing actions to the console

Async Redux comes with a built-in `ConsoleActionObserver` class that you can use as
a state observer. It will print all actions to the console, in yellow, like so:

```dart
I/flutter (15304): | Action MyAction
```

This helps with development, so you probably don't want to use it in release mode:

```dart
var store = Store<AppState>(
   actionObservers: kReleaseMode ? null : [ConsoleActionObserver()],
);
```

If you implement the action's `toString()`, you can display more information. 
For example, suppose a `LoginAction` which has a `username` field:

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
