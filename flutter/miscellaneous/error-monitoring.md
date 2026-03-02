---
sidebar_position: 14
---

This page explains how to set up your app to use 3rd-party services like Sentry
or Firebase Crashlytics to monitor your app for errors in production,
and print them to the console in development and testing.

AsyncRedux allows you to set it up in a centralized way, so that you don't have to "pollute" your code with
logging calls.

You may subclass `GlobalErrorObserver` and pass it to the store constructor.
I suggest you also specify an `environment` parameter, so that you can have different error monitoring
behavior in production, development and testing:

```dart
var store = Store<AppState>(
  initialState: state,
  globalErrorObserver: (store) => AppErrorObserver(store), // Here!
  environment: Environment.production, // Here!
);
```

## GlobalErrorObserver

The `GlobalErrorObserver` is an abstract class with an `observe` method
which you can implement to be notified of any actions that throw errors,
and even modify or swallow the error.

Your observer will be given all errors thrown in your actions
(including those of type `UserException`). Then:

* If it returns the same `error` unaltered, the original error will be used.
* If it returns something else, that will be used instead of `error`.
* If it returns `null`, the error will be disabled (swallowed).

```dart
class AppErrorObserver extends GlobalErrorObserver<AppState> {

  @override
  Object? observe() {
    // Return `error` to keep it, return something else to replace it,
    // or return `null` to swallow it.
    return error;
  }
}
```

> **Important:** If instead of **returning** an error you **throw** an error inside the `observe`
> method, AsyncRedux will catch it and use it instead of `error`.
> In other words, returning an error or throwing an error has the same effect. However,
> it is still recommended to return the error rather than throwing it.

Note this observer is called **after** the action's `wrapError` method.

## Parameters

Inside the `observe` method, you can access the following:

- **`error`** — The error thrown by the action, **after** being processed by the action's `wrapError`.

- **`originalError`** — The error thrown by the action, **before** being processed by `wrapError`.

- **`stackTrace`** — The stack trace associated with the error.
 
- **`action`** — The action that triggered the error.
 
- **`store`** — Use it to read `store.environment`, `store.configuration` or `store.state`.
  Do **not** use it to dispatch new actions, because the store is still processing the current
  action and dispatching another may cause unexpected behavior.

For example:

```dart
class AppErrorObserver extends GlobalErrorObserver<AppState> {

  Environment get environment => store.environment;
  Config get configuration => store.configuration;
  AppState get state => store.state;

  @override
  Object? observe() {
    ...
  }
}
```

## Use cases

### 1. Centralized error logging

Use this to set up your app to use 3rd-party services like Sentry or Firebase
Crashlytics to monitor your app for errors in production, and print them to the
console in development and testing. Since you are setting it up in a centralized way,
you don't have to "pollute" your code with logging calls.

### 2. Converting exceptions into UserExceptions

Use this to have a global place to convert some exceptions into `UserException`s.
For example, your backend may throw some exceptions in response to a bad
connection to the server. In this case, you may want to show the user a dialog
explaining that the connection is bad, which you can do by converting it to
a `UserException`.

Note, this could also be done in the action's `wrapError`,
but then you'd have to add it to all actions that use Firebase.

## Complete example

A good pattern is to create an abstract observer class with a factory
that returns a different subclass depending on the environment:

```dart
var store = Store<AppState>(
  initialState: state,
  globalErrorObserver: (store) => AppErrorObserver.newInstance(store),
  environment: Environment.production,
);
```

```dart
abstract class AppErrorObserver extends GlobalErrorObserver<AppState> {

  static AppErrorObserver newInstance(Store<AppState> store) =>
      switch (store.environment as Environment) {
        Environment.production => _ProductionObserver(),
        Environment.staging => _StagingObserver(),
        Environment.test => _TestObserver(),
      };

  @override
  Object? observe() {
    _logErrors();
    return _convertError();
  }

  void _logErrors();
  Object _convertError();
}
```

### Production

In production, log errors to Sentry (or Firebase Crashlytics, etc.), and convert
non-user errors into user-friendly messages:

```dart
class _ProductionObserver extends AppErrorObserver {

  @override
  Object _convertError() {
    if (error is UserException)
      return error;
    else
      return UserException('Something went wrong. Please try again.');
  }

  @override
  void _logErrors() {
    if (error is! UserException) {
      Sentry.captureException(
        error,
        stackTrace: stackTrace,
        withScope: (scope) {
          scope.setTag('action', action.runtimeType.toString());
        },
      );
    }
  }
}
```

Note how `action.runtimeType` is sent to Sentry as a tag, so you can easily see which action
caused the error.

### Staging

In staging, print errors to the console for debugging, and use `addCause`
so the original error is also visible in the error dialog:

```dart
class _StagingObserver extends AppErrorObserver {

  @override
  Object _convertError() {
    debugPrint('Error in ${action.runtimeType}: $error\n$stackTrace');

    if (error is UserException)
      return error;
    else
      return UserException('Something went wrong.')
          .addCause(error);
  }

  @override
  void _logErrors() {}
}
```

### Testing

In tests, convert all errors to `UserException` so they don't interrupt the test flow.
You can then check for errors explicitly:

```dart
class _TestObserver extends AppErrorObserver {

  @override
  Object _convertError() {
    if (error is UserException)
      return error;
    else
      return UserException('ERROR: $error')
          .addCause(error);
  }

  @override
  void _logErrors() {}
}
```

Since unexpected errors won't fail the tests anymore (because they all now get
converted to `UserException`s), add this to your test teardowns:

```dart
late Store<AppState> store;
tearDown(() { expect(store.errors, isEmpty); });
```

Then, when you want to check that a specific action threw a specific error:

```dart
var status = await store.dispatchAndWait(MyAction());
expect(status.originalError, isA<SomeException>());
store.getAndRemoveFirstError();
```
