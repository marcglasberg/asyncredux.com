---
sidebar_position: 9
---

# Action status

All actions have a `status` property 
that help you do something only if an action finished without errors.

For example, consider this action that saves some information:

```dart
class SaveAction extends AppAction {     
  Future<AppState> reduce() async {
    bool isSaved = await saveMyInfo(); 
    if (!isSaved) throw UserException('Save failed');	 
    return null;
  }
}
```

Then, in your widget, if you want to pop the current screen 
only if the saving succeeded, use `status.isCompletedOk`:

```dart
var status = await dispatch(SaveAction());
if (status.isCompletedOk) Navigator.pop(context); // Here! 
```

---

## Testing with action status

:::warning
The features below are meant for testing and debugging.
You likely will not use them in production.
In production code, you are interested in state changes, not action statuses.
:::

The `status` property is of type `ActionStatus`.

You can read the action status at any time,
while the action is running, and after it finishes.
However, since the status object is immutable, 
it always shows the state of the action at the moment you read it:

```dart
var action = MyAction();

var status = action.status;
print(status);

dispatch(action);

var status = action.status;
print(status);
```

## Has the action completed?

* `action.status.isCompleted`: Use it to check if a dispatched action has finished.
It will be `false` if the action is still running or has not been dispatched yet.

* `action.status.isCompletedOk`: Use it to check if the action finished without errors
(that is, both `before` and `reduce` ran without throwing errors).

* `action.status.isCompletedFailed`: Use it  to check if the action finished with errors.

Example:

```dart
var action = MyAction(); 
await store.dispatchAndWait(action);
print(action.isCompletedOk);
```

Or you can get the status directly from `dispatchAndWait`:

```dart       
var status = await store.dispatchAndWait(MyAction());
print(status.isCompletedOk);
```

## Getting the action error

If the action finished with an error, you can read the original error:

```dart
var error = action.status.originalError;
```

It is called the "original error" because it comes from the `before` or `reduce` methods.
However, it may have been changed by the `wrapError()` method.

To get the changed version, use:

```dart
var error = action.status.wrappedError;
```

## How far did the action run?

You can check if the action finished running the `before`, `reduce`, and `after` methods:

```dart
var status = await dispatch(MyAction(info));
print(action.status.hasFinishedMethodBefore);
print(action.status.hasFinishedMethodReduce);
print(action.status.hasFinishedMethodAfter);
```
