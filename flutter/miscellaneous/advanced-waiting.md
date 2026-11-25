---
sidebar_position: 2
---

# Advanced waiting

It is common to show a visual hint that an important process is running and should finish soon.
Examples include:

* A save button showing a [spinner](https://api.flutter.dev/flutter/material/CircularProgressIndicator-class.html)
  while saving.

* A `Text("Please wait...")` on screen while something is being calculated.

* A <a href="https://pub.dev/packages?q=shimmer">shimmer</a> used as a placeholder while data loads.

* A modal barrier that blocks user interaction while a screen opens.

<br></br>

In [Wait, fail, succeed](../basics/wait-fail-succeed) I explain that the easiest way to handle this is to use:

* `isWaiting(MyAction)` in actions
* `context.isWaiting(MyAction)` in widgets

Here, `MyAction` is the async action that runs the process you are waiting for.
This approach is very easy to use and fits most situations.

Try running
the <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_wait_action_simple.dart">Is Waiting Simple Example</a>.
It shows a modal barrier while an action runs, with a single line in the widget:
`context.isWaiting(IncrementAndGetDescriptionAction)`. Nothing is added to the state, and
nothing has to be cleaned up when the action finishes or fails.

## Many instances of the same action

`context.isWaiting(MyAction)` is true while **any** `MyAction` is running. That is not enough
when the same action runs for many items at once, and each item must show its own progress.

For that, give the action a `statusKey`, as explained in
[Status per key](../basics/wait-fail-succeed#status-per-key). The key is a value made from the
action's own fields, and it must never change for the same action. Then pass the same value to
`context.isWaiting()`.

Here is the <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_wait_action_advanced_1.dart">Is Waiting Advanced 1 Example</a>.
10 buttons are shown. When a button is clicked it will be replaced by a downloaded text
description. Each button shows a progress indicator while its own description is downloading.
Also, the screen title shows the text `"Downloading..."` if any of the buttons is currently
downloading.

![](https://raw.githubusercontent.com/marcglasberg/async_redux/refs/heads/master/example/lib/images/waitAction.png)

The key is simply the index of the button, from `0` to `9`:

```dart
class GetDescriptionAction extends AppAction {
  final int index;
  GetDescriptionAction(this.index);

  @override
  Object? get statusKey => index;

  @override
  Future<AppState> reduce() async { ... }
}
```

Each button asks for its own index, and the title asks without a key:

```dart
// In the button of one index:
var waiting = context.isWaiting(GetDescriptionAction, statusKey: index);

// In the screen title: true if ANY button is downloading.
var waiting = context.isWaiting(GetDescriptionAction);
```

### Composite keys

If one value is not enough to identify the action, return a record. Records are compared by
content, so a new record created in the widget matches the one in the action. This can be seen
in the <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_wait_action_advanced_2.dart">Is Waiting Advanced 2 Example</a>,
where each row has two buttons, one for the character's name and one for its height, and the
same action downloads either of them:

```dart
class GetFieldAction extends AppAction {
  final int index;
  final String field;
  GetFieldAction(this.index, this.field);

  @override
  Object? get statusKey => (index, field);
  ...
}

// In the widget:
var waiting = context.isWaiting(GetFieldAction, statusKey: (index, 'name'));
```

### Failures per key

`context.isFailed()`, `context.exceptionFor()` and `context.clearExceptionFor()` take the same
`statusKey` parameter, so each button can also show its own error message, and clear it:

```dart
if (context.isFailed(GetDescriptionAction, statusKey: index)) {
  var message = context.exceptionFor(GetDescriptionAction, statusKey: index)?.message;
  return Text(message ?? 'Download failed');
}
```

The store keeps one small record per key that failed (the action type, the key, and the
error), until the action runs again for that key, or you call `clearExceptionFor` with that
key (or without a key, to clear all keys of the type). `store.clearAllExceptions()` clears all
types, and is already called by `store.internalMixinProps.clear()` and `store.shutdown()`.

## Waiting for something that is not an action

The `statusKey` is tied to one action: the waiting starts when the action is dispatched and
ends when it finishes, fails or is aborted. If you need to wait for something that is not a
single action, for example a flag that one action turns on and another action turns off, keep a
boolean in the state. In
[Before and After the Reducer](../advanced-actions/before-and-after-the-reducer) I show how to
create a `BarrierAction` with a boolean flag used to add or remove a modal barrier in the screen
(see the code <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_before_and_after.dart">here</a>).
