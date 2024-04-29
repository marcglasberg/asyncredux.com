---
sidebar_position: 16
---

# Errors thrown by Actions

AsyncRedux has special provisions for dealing with errors, including observing errors, showing
errors to users, and wrapping errors into more meaningful descriptions.

Let's see an example. Suppose a logout action that checks if there is an internet connection, and
then deletes the database and sets the store to its initial state:

```dart
class LogoutAction extends ReduxAction<AppState> {
  @override
  Future<AppState> reduce() async {
	await checkInternetConnection();
	await deleteDatabase();
	dispatch(NavigateToLoginScreenAction());
	return AppState.initialState();
  }
}
```

In the above code, the `checkInternetConnection()` function checks if there is an
<a href="https://pub.dev/packages/connectivity">internet connection</a>, and if there isn't it
throws an error:

```dart
Future<void> checkInternetConnection() async {
	if (await Connectivity().checkConnectivity() == ConnectivityResult.none)
		throw NoInternetConnectionException();
}
```

All errors thrown by action reducers are sent to the **ErrorObserver**, which you may define during
store creation. For example:

```dart
var store = Store<AppState>(
  initialState: AppState.initialState(),
  errorObserver: MyErrorObserver<AppState>(),
);

class MyErrorObserver<St> implements ErrorObserver<St> {
  @override
  bool observe(Object error, StackTrace stackTrace, ReduxAction<St> action, Store store) {
    print("Error thrown during $action: $error");
    return true;
  }
}                                                                                               
```

If your error observer returns `true`, the error will be rethrown after the `errorObserver`
finishes. If it returns `false`, the error is considered dealt with, and will be "swallowed" (not
rethrown).

<br></br>

### Giving better error messages

If your reducer throws some error you probably want to collect as much information as possible. In
the above code, if `checkInternetConnection()` throws an error, you want to know that you have a
connection problem, but you also want to know this happened during the logout action. In fact, you
want all errors thrown by this action to reflect that.

The solution is implementing the optional `wrapError(error)` method:

```dart
class LogoutAction extends ReduxAction<AppState> {

  @override
  Future<AppState> reduce() async { ... }

  @override
  Object wrapError(error)
	  => LogoutError("Logout failed.", cause: error);
}
```

Note the `LogoutError` above gets the original error as cause, so no information is lost.

In other words, the `wrapError(error)` method acts as the "catch" statement of the action.

<br></br>

### User exceptions

To show error messages to the user, make your actions throw an `UserException`, and then wrap your
home-page with `UserExceptionDialog`, below `StoreProvider` and `MaterialApp`:

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context)
	  => StoreProvider<AppState>(
		  store: store,
		  child: MaterialApp(
		    navigatorKey: navigatorKey,
			home: UserExceptionDialog<AppState>(
			  child: MyHomePage(),
			)));
}
```

Note: If you are not using the `home` parameter of the `MaterialApp` widget, you can also put the
`UserExceptionDialog` the `builder` parameter. Please note, if you do that you **must** define the
`NavigateAction.navigatorKey` of the Navigator. Please, see the documentation of the
`UserExceptionDialog.useLocalContext` parameter for more information.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_show_error_dialog.dart">
Show Error Dialog Example</a>.

**In more detail:**

Sometimes, actions fail because the user provided invalid information. These failings don't
represent errors in the code, so you usually don't want to log them as errors. What you want,
instead, is just warn the user by opening a dialog with some corrective information. For example,
suppose you want to save the user's name, and you only accept names with at least 4 characters:

```dart
class SaveUserAction extends ReduxAction<AppState> {
   final String name;
   SaveUserAction(this.name);

   @override
   Future<AppState> reduce() async {
	 if (name.length < 4) dispatch(ShowDialogAction("Name must have at least 4 letters."));
	 else await saveUser(name);
	 return null;
   }
}
```

Clearly, there is no need to log as an error the user's attempt to save a 3-char name. The above
code dispatches a `ShowDialogAction`, which you would have to wire into a Flutter error dialog
somehow.

However, there's an easier approach. Just throw AsyncRedux's built-in `UserException`:

```dart
class SaveUserAction extends ReduxAction<AppState> {
   final String name;
   SaveUserAction(this.name);

   @override
   Future<AppState> reduce() async {
	 if (name.length < 4) throw UserException("Name must have at least 4 letters.");
	 await saveName(name);
	 return null;
   }
}
```

The special `UserException` error class represents "user errors" which are meant as warnings to the
user, and not as code errors to be logged. By default, if you don't define your own `errorObserver`,
only errors which are not `UserException` are thrown. And if you do define an `errorObserver`,
you'd probably want to replicate this behavior.

In any case, `UserException`s are put into a special error queue, from where they may be shown to
the user, one by one. You may use `UserException` as is, or subclass it, returning title and message
for the alert dialog shown to the user. _Note: In the `Store` constructor you can set the maximum
number of errors that queue can hold._

As explained in the beginning of this section, if you use the build-in error handling you must wrap
your home-page with `UserExceptionDialog`. There, you may pass the `onShowUserExceptionDialog`
parameter to change the default dialog, show a toast, or some other suitable widget:

```dart
UserExceptionDialog<AppState>(
	  child: MyHomePage(),
	  onShowUserExceptionDialog:
		  (BuildContext context, UserException userException) => showDialog(...),
);
``` 

> Note: The `UserExceptionDialog` can display any error widget you want in front of all the others
> on the screen. If this is not what you want, you can easily create your
> own `MyUserExceptionWidget` to intercept the errors and do whatever you want. Start by
> copying `user_exception_dialog.dart` (which contains `UserExceptionDialog` and its `_ViewModel`)
> into another file, and search for the `didUpdateWidget` method. This method will be called each
> time an error is available, and there you can record this information in the widget's own state.
> You can then change the screen in any way you want, according to that saved state, in this
> widget's `build` method.

<br></br>

### Converting third-party errors into UserExceptions

Third-party code may also throw errors which should not be considered bugs, but simply messages to
be displayed in a dialog to the user.

For example, Firebase my throw some `PlatformException`s in response to a bad connection to the
server. In this case, you can convert this error into a `UserException`, so that a dialog appears to
the user, as already explained above. There are two ways to do that.

The first is to do this conversion in the action itself by implementing the
optional `ReduxAction.wrapError(error)` method:

```dart
class MyAction extends ReduxAction<AppState> {

  @override
  Object? wrapError(error) {
     if ((error is PlatformException) && (error.code == "Error performing get") &&
               (error.message == "Failed to get document because the client is offline."))
        return UserException("Check your internet connection.").addCause(error);
     else 
        return error; 
  }    
```

However, then you'd have to add this to all actions that use Firebase. A better way is doing this
globally by passing a `GlobalWrapError` object to the store:

```dart              
var store = Store<AppState>(
  initialState: AppState.initialState(),
  globalWrapError: MyGlobalWrapError(),
);

class MyGlobalWrapError extends GlobalWrapError {
  @override
  Object? wrap(error, stackTrace, action) {
    if ((error is PlatformException) && (error.code == "Error performing get") &&
          (error.message == "Failed to get document because the client is offline.")) 
        return UserException("Check your internet connection.").addCause(error);
    else 
        return error;
  }
}    
```

The `GlobalWrapError` object will be given all errors. It may then return a `UserException` which
will be used instead of the original exception. Otherwise, it just returns the original `eerror`,
so that it will not be modified. It may also return `null` to disable (swallow) the error.

Note this wrapper is called **after** `ReduxAction.wrapError`, and **before** the `ErrorObserver`.

<br></br>

### UserExceptionAction

If you want the `UserExceptionDialog` to display some `UserException`, you must throw the exception
from inside an action's `before()` or `reduce()` methods.

However, sometimes you need to create some **callback** that throws an `UserException`. If this
callback is called **outside** an action, the dialog will **not** display the exception. To solve
this, the callback should not throw an exception, but instead call the
provided `UserExceptionAction`, which will then simply throw the exception in its own `reduce()`
method.

The `UserExceptionAction` is also useful even inside of actions, when you want to display an error
dialog to the user, but you don't want to interrupt the action by throwing an exception.
