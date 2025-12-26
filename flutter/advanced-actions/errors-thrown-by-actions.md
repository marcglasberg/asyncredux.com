---
sidebar_position: 3
---

# Errors thrown by actions

When an action runs, it may run into problems. For example:

* A bug in your code
* A network request fails
* A database operation fails
* A file is not found
* A user types an invalid value 
* A user tries to log in with a wrong password
* A user tries to delete an item that does not exist

In AsyncRedux, when an action hits a problem,
you are allowed to do the obvious thing and simply throw an error.
In this case, we say the action **failed**.

AsyncRedux has built in support for handling these errors.
It lets you observe them, show them to the user, or wrap them with better descriptions.

## Showing a dialog when an action fails

We already explained how to show a dialog when an action fails
in [this page](../basics/failed-actions). Please read that first.

## Stopping the action

As explained before, every action must override the `reduce()` method,
and you can also override the optional methods `before()` and `after()` 
(see [here](./before-and-after-the-reducer)).

If `before()` throws an error, the reducer will not run.
If `reduce()` throws an error, it stops before finishing.
In both cases, no new state is returned,
and **the store state will not change**.

However, `after()` will always run, even if there was an error.
Use it to clean up any resources the action used.

If you need to know whether the action failed,
you can check the [action status](./action-status).

## Example

Let's build an example to think about error handling.

Suppose a logout action first checks for internet,
then deletes the database, resets the store,
and navigates to the login screen:

```dart
class LogoutAction extends AppAction {

  Future<AppState> reduce() async {
	await checkInternetConnection();
	await deleteDatabase();
	dispatch(NavigateToLoginScreenAction());
	return AppState.initialState();
  }
}
```

Suppose `checkInternetConnection()` checks for an [internet connection](https://pub.dev/packages/connectivity)
and throws an error when there is none:


```dart
Future<void> checkInternetConnection() async {
	if (await Connectivity().checkConnectivity() == ConnectivityResult.none)
		throw NoInternetConnectionError();
}
```

With this example in mind, let's explore our options.

## Local error handling

When an action throws an error,
you may want to collect as much information as possible about it.
This can be useful for debugging, or for showing the user a more informative error message.

In the above code, if `checkInternetConnection()` throws an error,
you want to know it happened during logout.
In fact, you want all errors in this action to include that context.

To do this, override `wrapError()`.
It works like a catch block for the whole action.
It receives the original error and must return the new one to throw.

In more detail:

* To change the error, return something new.
* To disable the error, return `null`.
* To keep it the same, just return the same error unaltered.

A common use is to wrap the original error inside another error with more meaning:

```dart
class LogoutAction extends AppAction {
  
  Future<AppState> reduce() async { ... }
  
  Object wrapError(error, stacktrace)
	  => LogoutError("Logout failed", cause: error);
}
```

Here, `LogoutError` keeps the original error as its cause, so no information is lost.

## Showing a dialog to the user

Suppose an action tries to convert a string into a number using `parse()`.
If it fails, you want to show a dialog asking the user to enter a valid number.

The `parse()` method throws `FormatException`, but we need a `UserException` instead.

As previously discussed, throwing a `UserException` will automatically show a dialog to the user.
Here is a possible solution using `try/catch`:

```dart
class ConvertAction extends AppAction {  
  final String text;
  ConvertAction(this.text);
  
  AppState reduce() async {
    try {
      var value = int.parse(text);
      return state(counter: value); 
    } catch (error) {
      throw UserException('Please enter a valid number').addCause(error);
    }
  }
}    
```

But you can do the same thing with `wrapError()`:

```dart
class ConvertAction extends AppAction {
  final String text;
  ConvertAction(this.text);
  
  Future<AppState> reduce() async {
    return int.parse(text);
  }
  
  Object wrapError(error, stacktrace)
      => UserException('Please enter a valid number').addCause(error);
}
```

### Creating a Mixin

To reuse this behavior, you can create a mixin:

```dart
mixin ShowUserException on AppAction {

  abstract String getErrorMessage();
  
  Object wrapError(error, stacktrace)
    => UserException(getErrorMessage()).addCause(error);
}
```

Then write `with ShowUserException`:

```dart
class ConvertAction extends AppAction with ShowUserException {  
  final String text;
  ConvertAction(this.text);
  
  Future<AppState> reduce() async {
    return int.parse(text);
  }
  
  String getErrorMessage() => "Please enter a valid number.";
}
```

## Global error handling

Sometimes, third party code throws errors that are not bugs,
but should still be shown to the user.

For example, Firebase may throw `PlatformException` when the client is offline.
In that case, it may be better to convert it into a `UserException`
so a dialog appears.

One way, discussed above, is to convert it inside the action using `wrapError()`:

```dart
class MyAction extends AppAction {
  
  Object? wrapError(error, stacktrace) {
    if ((error is PlatformException) && (error.code == "Error performing get") &&
       (error.message == "Failed to get document because the client is offline.")) {
      return UserException('Check your internet connection').addCause(error);
    } else { 
      return error;
    }    
  }    
```

But this would need to be added to all actions that use Firebase.

A better way is to handle it globally with a `GlobalWrapError`, when creating the store:

```dart              
var store = Store<AppState>(
  initialState: AppState.initialState(),
  globalWrapError: MyGlobalWrapError(),
);

class MyGlobalWrapError extends GlobalWrapError {
  
  Object? wrap(error, stackTrace, action) {
    if ((error is PlatformException) && (error.code == "Error performing get") &&
       (error.message == 'Failed to get document because the client is offline')) { 
      return UserException('Check your internet connection').addCause(error);
    } else {  
      return error;
  }
}    
```

The `GlobalWrapError` receives all errors.
It may return a `UserException`,
or return the original error unchanged,
or return `null` to disable (swallow) the error.

> Note: The global wrapper runs **after** `wrapError()` from the action,
> and **before** the `ErrorObserver` described below.

## Disabling errors

To disable an error inside `wrapError()`, return `null`.

For example, if you want to swallow errors of type `MyException`:

```dart
wrapError(error, stacktrace) 
  => (error is MyException) ? null : error
```

To do this globally, use `GlobalWrapError`:

```dart
class MyGlobalWrapError extends GlobalWrapError {
  
  Object? wrap(error, stackTrace, action) 
    => (error is MyException) ? null : error;
}
```

## Error observer

When creating the store, you may pass an `ErrorObserver`.

All errors thrown by actions are sent to it,
along with the stack trace, the action, and the store.

For example:

```dart
var store = Store<AppState>(
  initialState: AppState.initialState(),
  errorObserver: MyErrorObserver<AppState>(),
);

class MyErrorObserver<St> implements ErrorObserver<St> {
  
  bool observe(Object error, StackTrace stackTrace, ReduxAction<St> action, Store store) {
    print("Error thrown during $action: $error");
    return true;
  }
}                                                                                               
```

The `observe()` method returns a boolean:

* If it returns `true`, the error will be rethrown.
* If it returns `false`, the error is swallowed.

## UserExceptionAction

As explained in
[failed actions](../basics/failed-actions),
`UserException` is a special error that AsyncRedux catches
and shows to the user in a dialog or another UI.

For this to work, the `UserException` must be thrown
from inside `before()` or `reduce()`.

If you are **not** inside an action but still want to show a dialog,
you can use `UserExceptionAction`:

```dart
dispatch(UserExceptionAction('Please enter a valid number'));
```

This action throws a `UserException` from its `reduce()` method.

It is also useful inside actions when you want to show an error
but keep the action running:

```dart
class ConvertAction extends AppAction {  
  final String text;
  ConvertAction(this.text);
  
  Future<AppState> reduce() async {
    var value = int.tryParse(text);
    
    if (value == null) { 
      dispatch(UserExceptionAction('Please enter a valid number'));
    }  
          
    return state(counter: value ?? 0);
  }
}    
```

In this case, an invalid number will show an error dialog,
but the counter will be set to zero and the action continues.

