---
sidebar_position: 11
---

# Failed actions

Actions that fail can simply throw errors using `throw SomeError()`.

Throwing an error interrupts the execution of the action reducer,
meaning it will not return a new state, and will not modify the application state.

AsyncRedux will also automatically catch those errors and deal with them globally,
depending on the error type. We will see later how to set up this general error handling,
but for the moment let's see how to deal with a specific type of error called a **user exception**.

## User exceptions

An `UserException` is a special type of error, provided natively by AsyncRedux.
It's meant to be shown to the user, and not to be considered a bug in the code.

If something wrong happens, and it's something the user can fix,
you can `throw UserException('Some error message')` with a suitable error message.

For example, if a user is transferring money and the amount is zero,
you don't want to log this as an error, but show a message to the user
saying "You cannot transfer zero money".

```dart
class TransferMoney extends AppAction {
  final double amount;
  TransferMoney(this.amount);
  
  AppState? reduce() {
  
    if (amount == 0) { 
      throw UserException('You cannot transfer zero money.');
     
    return state.copy(cash: state.cash - amount);    
  }
}
```

As another example, suppose you only accept user names with at least 4 letters:

```dart
class SaveUser extends AppAction {
  final String name;
  SaveUser(this.name);

  Future<AppState?> reduce() async {
    
    if (name.length < 4) 
      throw UserException('Name must have 4 letters.');
    
    await saveUser(name);
    return null;
  }
}
```

## Error queue

When an action throws a `UserException`, it is added to a special error queue in the store.
In the `Store` constructor, you can optionally set the maximum number of errors that the queue can hold.

An error widget (a dialog, a toast, a list of errors) can read the queue and show each error to the user, one at a time.
This widget should be set up once, globally, usually by your Team Lead.
After that, developers only need to throw `UserExceptions`  in their code to show error messages to the user.

## Showing error messages

AsyncRedux includes a built-in error dialog.
To use it, wrap your home page with `UserExceptionDialog`, below both `StoreProvider` and `MaterialApp`:

```dart
class MyApp extends StatelessWidget {

  Widget build(BuildContext context) {  
    return StoreProvider<AppState>(
      store: store,
      child: MaterialApp(
        navigatorKey: navigatorKey,
        home: UserExceptionDialog<AppState>( // Here!
          onShowUserExceptionDialog: ... // Here!
          child: MyHomePage(),
          ...
```

> If you are not using the `home` parameter of `MaterialApp`, you can also use the `builder` parameter.
> In that case, you must define the `NavigateAction.navigatorKey` of the Navigator.
> See the documentation of the `UserExceptionDialog.useLocalContext` parameter for details.

The `onShowUserExceptionDialog` parameter in the code above is optional.
If you do not set it, a default dialog is shown with the error message and an OK button to dismiss it.

However, you can provide your own logic for this parameter to show a custom dialog, a toast, or any widget you prefer:

```dart
UserExceptionDialog<AppState>(  
  onShowUserExceptionDialog:
    (BuildContext context, UserException userException) 
      => showDialog(...),
  ...  
```

`UserExceptionDialog` shows your error widget in front of all others.
If this is not what you want, you can create your own widget to intercept the errors.

To do this, copy `user_exception_dialog.dart` into a new file.
Look for the `didUpdateWidget` method. It runs each time a new error is available.
You can save the error in the widget's state
and then use it in the `build` method to change the screen in any way you want.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_show_error_dialog.dart">
Show Error Dialog Example</a>.

<hr></hr>

Next, let's see how failed actions can also be shown as error messages inside your widgets.

## Changing the default error dialog
