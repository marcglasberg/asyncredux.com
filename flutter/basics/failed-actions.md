---
sidebar_position: 11
---

# Failed actions

Actions that fail can simply throw errors using `throw SomeError()`.

Throwing an error interrupts the execution of the action reducer,
meaning it will not return a new state, and will not modify the store state.

Async Redux will also automatically catch those errors and deal with them globally,
depending on the error type. We will see later how to set up this general error handling,
but for the moment let's see how to deal with only a specific type of error called
a **user exception**.

# User exceptions

An `UserException` is a special type of error, provided natively by Async Redux.
It's meant to be shown to the user, and not to be considered a bug in the code.

In other words, if something wrong happens in an action, and it's something that the user can fix,
you can `throw UserException('Some error message')` with a suitable error message.

For example, if a user is transferring money and the amount is zero,   
you don't want to log this as an error, but you want to show a message to the user
saying "You can't transfer zero money":

```dart
class TransferMoneyAction extends AppAction {
  final double amount;
  TransferMoneyAction(this.amount);

  @override
  Future<AppState> reduce() async {
    if (amount == 0) throw UserException('You can't transfer zero money.');
    else return state.copy(cashBalance: state.cashBalance - amount);
  }
}
```

As another example, suppose you want to save the user's name, and you only accept names with at
least 4 characters:

```dart
class SaveUserAction extends ReduxAction<AppState> {
   final String name;
   SaveUserAction(this.name);

   @override
   Future<AppState> reduce() async {
	 if (name.length < 4) dispatch(ShowDialogAction('Name must have at least 4 letters.'));
	 else await saveUser(name);
	 return null;
   }
}
```

## Error queue

When an action throws an `UserException`, it is put automatically into a special error queue
in the store, from where it may be shown to the user by an "error widget" that consumes the errors,
one by one.

The error widget should be set up by your Team Lead once, globally.
All that the regular developers have to do in their day-to-day work is throw `UserException`s and
be done with it.

What the error widget looks like is up to you. It can be a dialog that opens with the error message,
it can be a toast, a list of errors displayed somewhere, or something else entirely.

Providing your own widget to consume the error queue is an advanced topic that will be covered
later, but for now, let's see how to use the built-in error dialog that's provided out of the box
by Async Redux.

## Showing error messages in a dialog

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

> Note: If you are not using the `home` parameter of the `MaterialApp` widget, you can also put
> the `UserExceptionDialog` the `builder` parameter. Please note, if you do that you **must**
> define the `NavigateAction.navigatorKey` of the Navigator. Please, see the documentation of
> the `UserExceptionDialog.useLocalContext` parameter for more information.

> Note: In the `Store` constructor you can set the maximum number of errors that queue can hold.

# Changing the default error dialog

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

The `UserExceptionDialog` can display any error widget you want in front of all the others
on the screen. If this is not what you want, you can easily create your
own `MyUserExceptionWidget` to intercept the errors and do whatever you want. Start by
copying `user_exception_dialog.dart` (which contains `UserExceptionDialog` and its `_ViewModel`)
into another file, and search for the `didUpdateWidget` method. This method will be called each
time an error is available, and there you can record this information in the widget's own state.
You can then change the screen in any way you want, according to that saved state, in this
widget's `build` method.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_show_error_dialog.dart">
Show Error Dialog Example</a>.

<hr></hr>

Next, let's see how failed actions can also be shown as error messages inside your widgets. 
