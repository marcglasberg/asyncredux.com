---
sidebar_position: 4
---

# Errors thrown by actions

When your action runs, it may encounter problems. Examples include:

* A bug in your code
* A network request fails
* A database operation fails
* A file is not found
* A user types an invalid value in a form
* A user tries to log in with an invalid password
* A user tries to delete a non-existing item

In Async Redux, if your action encounters a problem, you are allowed to do the obvious thing
and simply throw an error. In this case, we say that the action "failed".

Async Redux has special provisions for dealing with errors thrown by actions,
including observing errors, showing errors to users, and wrapping errors into more meaningful
descriptions.

## Showing a dialog when an action fails

We have already discussed how to show a dialog to the user when an action fails, [here](../basics/failed-actions).
Please make sure to read that page first.

## Stopping the action

As previously discussed, apart from the `reduce()` method that all actions must override,
there are also two other methods that you _may_ override,
called [before and after](./before-and-after-the-reducer).

If an action throws an error in its `before()` method, the reducer will not even be executed.
If an action throws an error in its `reduce()` method, the reducer will stop before completing.
In both cases, the reducer will not return a new state,
and **the store state will not be modified**.

However, the action's `after()` method will always be called,
no matter if the action throws an error or not.
This means that if you need to clean up some action resources,
you should do it in the `after()` method.

And if at any point you need to know if the action failed,
you can check the [action status](./action-status).

## Example

Let's create an example to help us think about error handling in actions.

Suppose that a "logout action" first checks if there is an internet connection.
If there is, it deletes the app database, sets the store to its initial state,
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

In the above code, suppose the `checkInternetConnection()` function checks if there is an
<a href="https://pub.dev/packages/connectivity">internet connection</a>, and if there isn't it
throws an error:

```dart
Future<void> checkInternetConnection() async {
	if (await Connectivity().checkConnectivity() == ConnectivityResult.none)
		throw NoInternetConnectionError();
}
```

With this example in mind, let's explore our options.

## Local error handling

If your action throws some error,
you probably want to collect as much information as possible about it.
This can be useful for debugging, or for showing the user a more informative error message.

In the above code, if `checkInternetConnection()` throws an error,
you want to know that you have a connection problem,
but you also want to know this happened during the logout action.
In fact, you want all errors thrown by this action to reflect that.

The solution is overriding your action's `wrapError()` method.
It acts as a sort of "catch" statement of the action.

It automatically gets all errors thrown by the action,
and it has a return value which is the new error to be thrown.

In other words:

* To modify the error, override the `wrapError()` method and return something.
* To keep the error the same, just return it unaltered, or don't override `wrapError()`.

Usually you'll want to wrap the error inside another that better describes the failed action,
or contains more information.

This is how you could do it in the `LogoutAction`:

```dart
class LogoutAction extends AppAction {
  
  Future<AppState> reduce() async { ... }
  
  Object wrapError(error, stacktrace)
	  => LogoutError("Logout failed", cause: error);
}
```

Note the `LogoutError` above includes the original error as a cause, so no information is lost.

## Showing a dialog to the user

Consider an action that tries to convert a String into a number using the `parse()` function.
If the conversion fails, you may want to show a dialog to the user, asking them to
enter a valid number.

The `parse` method throws a `FormatException` in case of failure,
but we actually needed a `UserException`.

As previously discussed, throwing a `UserException` will automatically show a dialog to the
user, where the dialog's message is the exception's message.

This is a possible solution, using `try/catch`:

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

However, you can achieve the same by overriding the `wrapError()` method:

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

You may also create a mixin to make it easier to add this behavior to multiple actions:

```dart
mixin ShowUserException on AppAction {

  abstract String getErrorMessage();
  
  Object wrapError(error, stacktrace)
    => UserException(getErrorMessage()).addCause(error);
}
```

Which allows you to write `with ShowUserException`:

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

Third-party code may also throw errors which should not be considered bugs,
but simply messages to be displayed in a dialog to the user.

For example, Firebase may throw some `PlatformException`s
in response to a bad connection to the server.

In this case, it may be a good idea to convert this error into a `UserException`,
so that a dialog appears to the user, as already explained above.

There are two ways to do that. One of them we discussed above:
Just convert it in the action itself
by implementing the optional `wrapError()` method:

```dart
class MyAction extends AppAction {
  
  Object? wrapError(error, stacktrace) {
     if ((error is PlatformException) && (error.code == "Error performing get") &&
               (error.message == "Failed to get document because the client is offline."))
        return UserException('Check your internet connection').addCause(error);
     else 
        return error; 
  }    
```

However, then you'd have to add this code to all actions that use Firebase.

A better way is doing this globally by using a `GlobalWrapError` object when you create the store:

```dart              
var store = Store<AppState>(
  initialState: AppState.initialState(),
  globalWrapError: MyGlobalWrapError(),
);

class MyGlobalWrapError extends GlobalWrapError {
  
  Object? wrap(error, stackTrace, action) {
    if ((error is PlatformException) && (error.code == "Error performing get") &&
          (error.message == 'Failed to get document because the client is offline')) 
        return UserException('Check your internet connection').addCause(error);
    else 
        return error;
  }
}    
```

The `GlobalWrapError` object will be given all errors. It may then return a `UserException` which
will be used instead of the original exception. Otherwise, it just returns the original `error`,
so that it will not be modified. It may also return `null` to disable (swallow) the error.

> Note: The global error wrapper is called **after** the action's `wrapError()` method,
> and **before** the `ErrorObserver` that we'll discuss below.

## Disabling errors

If you want the action's `wrapError()` to disable the error, simply return `null`.

For example, suppose you want to let all errors pass through, except for errors of
type `MyException`:

```dart
wrapError(error, stacktrace) 
  => (error is MyException) ? null : error
```

If you want this to happen globally, use the `GlobalWrapError` object instead:

```dart
class MyGlobalWrapError extends GlobalWrapError {
  
  Object? wrap(error, stackTrace, action) 
    => (error is MyException) ? null : error;
}
```

## Error observer

When the store is created, you have the opportunity to pass an `ErrorObserver` object.

All errors thrown by actions are sent to this **ErrorObserver**, together with their stack traces,
and a reference to the action that threw the error, and the store itself.

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

As you can see, the `observe` method returns a boolean:

* If it returns `true`, the error will be rethrown after the `errorObserver` finishes.
* If it returns `false`, the error is considered dealt with, and will be "swallowed" (not rethrown).

## UserExceptionAction

As [previously discussed](../basics/failed-actions), the `UserException` is a special type of error
that Async Redux automatically catches and shows to the user in a dialog, or other UI of your
choice.

For this to work, you must throw the `UserException` from inside an
action's `before()` or `reduce()` methods. Only then, Async Redux will be able to
catch the exception and show it to the user.

However, if you are **not** inside an action, but you still want to show an error dialog to the
user, you may use the provided `UserExceptionAction`.

```dart
dispatch(UserExceptionAction('Please enter a valid number'));
```

This action simply throws a corresponding `UserException` from its own `reduce()` method.

The `UserExceptionAction` is also useful inside of actions themselves,
if you want to display an error dialog to the user,
but you don't want to interrupt the action by throwing an exception.

For example, here an invalid number will show an error dialog to the user,
but the action will continue running and set the counter state to `0`:

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

