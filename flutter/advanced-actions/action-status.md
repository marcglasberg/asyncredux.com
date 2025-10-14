---
sidebar_position: 4
---

# Action status

All actions have a `status` property of type `ActionStatus`,
that provides information about the action execution.

You can read the action status at any point in time.
The status object is immutable, so it will
always reflect the state of the action at the time you read it.

```dart
var action = MyAction();

var status = action.status;
print(status);

dispatch(action);

var status = action.status;
print(status);
```

## Has the action completed?

You can use `action.status.isCompleted` to check if a dispatched action finished.
It will be `false` if the action is still running, or if it hasn't been dispatched yet.

You can use `action.status.isCompletedOk` to check if a dispatched action finished without
errors (in more detail, if the action methods `before` and `reduce` finished without throwing
any errors).

You can use `action.status.isCompletedFailed` to check if the action finished with errors.

An example:

```dart
var action = MyAction(); 
await store.dispatchAndWait(action);
print(action.isCompletedOk);
```

Better yet, you can get the status directly from the `dispatchAndWait` method:

```dart       
var status = await store.dispatchAndWait(MyAction());
print(status.isCompletedOk);
```

## Getting the action error

If the action finished with an error, you can get the original error:

```dart
var error = action.status.originalError;
```

That's called an "original error" because it's the error that was originally thrown by the
action's `before` or `reduce` methods.
However, this error might have been changed by the action's `wrapError()` method.

For this reason you can also get the "wrapped error":

```dart
var error = action.status.wrappedError;
```

## Up until which point did the action run?

You can also use the status properties to check if the action has finished running
the `before`, `reduce`, and `after` methods:

```dart
var status = await dispatch(MyAction(info));
print(action.status.hasFinishedMethodBefore);
print(action.status.hasFinishedMethodReduce);
print(action.status.hasFinishedMethodAfter);
```

## Use cases

The action status is useful mainly in testing and debugging scenarios.
In production code, you are usually more interested in the state change that the action caused,
rather than the action status.

However, one possible use case in production is doing something only if an action completed.

As an example, suppose you want to save some info,
and you want to leave the current screen if and only if a save process succeeded.

You could have the following save action:

```dart
class SaveAction extends AppAction {     
  Future<AppState> reduce() async {
    bool isSaved = await saveMyInfo(); 
    if (!isSaved) throw UserException('Save failed');	 
    return null;
  }
}
```

Then, in your widget, you can write:

```dart
var status = await dispatch(SaveAction(info));
if (status.isCompletedOk) Navigator.pop(context);  
```
