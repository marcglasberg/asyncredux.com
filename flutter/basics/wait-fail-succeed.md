---
sidebar_position: 12
---

# Wait, fail, succeed

Most async processes in your app take some time to finish, and they can either succeed or fail.
For example, loading data from a server or saving something to a database. 
You want to display a spinner while it's running, show the result when it completes,
or present an error message if it fails.

These are called "process states":

* **Waiting**: The process is currently running.
* **Failed**: The process failed with an error.
* **Succeeded**: The process succeeded.

In AsyncRedux, these processes happen when actions are dispatched, which means we need a way to
know if an action is currently being processed, if it succeeded, or if it just failed.

Thankfully, this is very easy to do with AsyncRedux, by using the following methods:

* `isWaiting(actionType)`: Returns true if the given action type is currently being processed.
* `isFailed(actionType)`: Returns true if the given action type just failed, with any error.
* `exceptionFor(actionType)`: Returns the `UserException` that caused the action to fail.
* `clearExceptionFor(actionType)`: Clears the failed state of the action.

## In widgets

In widgets, we have access to those methods by using the built-in extension methods on
the `context` object.

We have already previously seen how to read the state and dispatch actions from widgets:

```dart
Widget build(BuildContext context) {
  var counter = context.select((st) => st.counter);

  return Column(
    children: [
      Text('Counter: $counter'),
      ElevatedButton(
        onPressed: () => context.dispatch(IncrementAction()),
        child: Text('Increment'),
      ),
    ],
  );
}
```

Now, let's see how to show a spinner while an action is being processed, and show an error message.

## Show a spinner

Method `isWaiting(actionType)` returns true if the given action type is currently being
processed. By using this method, you can show a spinner while an action is being processed:

```dart
Widget build(BuildContext context) {
  var counter = context.select((st) => st.counter);

  return context.isWaiting(IncrementAction)
      ? CircularProgressIndicator()
      : Text('Counter: $counter');
}
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_show_spinner.dart">Show Spinner
Example</a>.
When you press the "+" button, it dispatches an increment action that
takes 2 seconds to finish. Meanwhile, a spinner is shown in the button, and the counter text gets
grey.

## Show an error message

Method `isFailed(actionType)` returns true if the given action type just failed, with any
error. By using this method, you can show an error message when an action fails:

```dart
Widget build(BuildContext context) {
  var counter = context.select((st) => st.counter);

  if (context.isFailed(IncrementAction)) return Text('Failed');
  return Text('Counter: $counter');
}
```

If the action failed with a `UserException`, you can get the exception by doing
`var exception = context.exceptionFor(actionType)` and then get the error message
to eventually show it in the UI. For any other kind of error, `isFailed` is still true,
but `exceptionFor` returns `null`. If you want a message for those errors too, your action
can turn them into `UserException`s in its `wrapError` method.

```dart
Widget build(BuildContext context) {
  var counter = context.select((st) => st.counter);

  if (context.isFailed(IncrementAction)) {
    var exception = context.exceptionFor(IncrementAction);
    return Text(exception?.message ?? 'Failed');
  }

  return Text('Counter: $counter');
}
```

## Combining `isWaiting` and `isFailed`

Suppose we have an async action that gets a list of items from a server. You can show a
spinner while the action is being processed, and show an error message if the action fails:

```dart
Widget build(BuildContext context) {
  var items = context.select((st) => st.items);

  if (context.isWaiting(GetItemsAction)) return CircularProgressIndicator();
  if (context.isFailed(GetItemsAction)) return Text('Failed');

  return ListView.builder(
    itemCount: items.length,
    itemBuilder: (context, index) => Text(items[index].name),
  );
}
```

Now let's repeat the previous code, but add a button (in a Column) that retries the action:

```dart
Widget build(BuildContext context) {
  var items = context.select((st) => st.items);

  if (context.isWaiting(GetItemsAction)) return CircularProgressIndicator();

  if (context.isFailed(GetItemsAction)) {
    return Column(
      children: [
        Text('Failed'),
        ElevatedButton(
          onPressed: () => context.dispatch(GetItemsAction()),
          child: Text('Retry'),
        ),
      ],
    );
  }

  return ListView.builder(
    itemCount: items.length,
    itemBuilder: (context, index) => Text(items[index].name),
  );
}
```

As soon as the user presses the retry button, the spinner will be shown again, 
and the error message will be cleared. 
This happens because the error message is cleared automatically when the action is dispatched again.

You can always clear the error message explicitly by
calling `context.clearExceptionFor(actionType)`, but it's not necessary to do so before
dispatching the action again.

## Status per key

The methods above work per action class. `context.isWaiting(LoadUser)` is true while **any**
`LoadUser` is running, and `context.isFailed(LoadUser)` is true if **any** `LoadUser` failed.

Suppose a list of users, where each row dispatches `LoadUser(userId)` to load its own user.
With the methods above, every row would show a spinner while any one user loads.

To tell the actions apart, give the action a `statusKey`. It's a getter that returns a value
made from the action's own fields:

```dart
class LoadUser extends AppAction {
  final String userId;
  LoadUser(this.userId);

  @override
  Object? get statusKey => userId;

  @override
  Future<AppState?> reduce() async {
    var user = await loadUser(userId);
    return state.copy(users: state.users.add(userId, user));
  }
}
```

Then, pass the same value to the methods, in the `statusKey` parameter. Each row now sees only
its own user:

```dart
Widget build(BuildContext context) {

  if (context.isWaiting(LoadUser, statusKey: userId)) return CircularProgressIndicator();

  if (context.isFailed(LoadUser, statusKey: userId)) {
    var exception = context.exceptionFor(LoadUser, statusKey: userId);
    return Text(exception?.message ?? 'Loading failed');
  }

  var name = context.select((st) => st.users[userId]?.name);

  return Text(name ?? '');
}
```

You can also pass `statusKey` when checking action status from the store or an action,
and when calling `context.clearExceptionFor`. Omitting it considers every action of the type.

The key can be any immutable value with `==` and `hashCode`: a String, a number, an enum, or a
record like `(userId, cartId)` for a composite key. Records are compared by content.

Two rules:

* **The key must always be the same.** Make it only from the fields set in the action's
  constructor. Don't use anything that can change: the state, the current time, or a field
  the action changes while it runs. The store reads the key when the action is dispatched,
  when it fails, and every time `isWaiting` is asked, so a key that changes would leave an
  old error on screen, or make the spinner stop matching the action.

* **Failures stay in memory until cleared.** For `isWaiting`, nothing extra is kept. For
  `isFailed` and `exceptionFor`, the store keeps a small record of each failure (the action
  type, the key, and the error). Without `statusKey` there is at most one record per action
  class. With `statusKey`, there is one record per key that failed, for example one per user
  whose `LoadUser` failed. A record goes away when the action runs again for that key, when
  you call `context.clearExceptionFor(LoadUser, statusKey: userId)`, or when you call
  `context.clearExceptionFor(LoadUser)` without a key, which clears all keys of that type.
  `store.clearAllExceptions()` clears all types. You rarely need it, because
  `store.internalMixinProps.clear()` (which you call on logout) and `store.shutdown()`
  already call it.

See [Advanced waiting](../miscellaneous/advanced-waiting) for a complete example, with a list
of buttons that each show their own progress indicator.

<hr></hr>

Now, let's see how AsyncRedux supports interacting with widgets 
that manage their own internal state,
as well as how to trigger one-time side effects, 
like opening a dialog or hiding the keyboard.
