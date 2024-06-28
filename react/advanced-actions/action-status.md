---
sidebar_position: 5
---

# Action status

All actions have a `status` property of type `ActionStatus`,
that provides information about the action execution.

You can read the action status at any point in time.
The status object is immutable, so it will
always reflect the state of the action at the time you read it.

```ts
let action = new MyAction();

let status = action.status;
console.log(status);

store.dispatchSync(action);

let status = action.status;
console.log(status);
```

## Has the action completed?

### action.status.isCompleted

Check if an action has completed dispatching, either with or without errors.

- **true**: the action's `after()` function already ran.

- **false**: the action is still running, or hasn't been dispatched yet.

### action.status.isCompletedOk

Check if an action has completed dispatching without errors.

- **true**: none of the `before()` or `reduce()` functions have thrown an error.
  This indicates that the `reduce()` function completed and returned a result (even if
  the result was `null`). The `after()` function also already ran.

- **false**: the action is still running, hasn't been dispatched yet, or completed with errors.

### action.status.isCompletedFailed

Check if the action has completed dispatching with errors.

- **true**: the action has completed, and the `after()` function already ran.
  Either the `before()` or the `reduce()` functions have thrown an error. It indicates that the
  reducer did **not** complete, and could not have returned a value to change the state.

- **false**: the action is still running, hasn't been dispatched yet, or completed without errors.

An example:

```ts
let action = new MyAction(); 
await store.dispatchAndWait(action);
console.log(action.isCompletedOk);
```

Better yet, you can get the status directly from the `dispatchAndWait` function:

```ts       
let status = await store.dispatchAndWait(MyAction());
console.log(status.isCompletedOk);
```

## Getting the action error

If the action finished with an error, you can get the original error:

```ts
let error = action.status.originalError;
```

That's called an "original error" because it's the error that was originally thrown by the
action's `before()` or `reduce()` functions.

In case this error is later changed by the action's `wrapError()` function,
you can also get the "wrapped error":

```ts
let error = action.status.wrappedError;
```

## Up until which point did the action run?

You can also use the status to check if the action has finished running
the `before()`, `reduce()`, and `after()` functions:

```ts
let status = await dispatchAndWait(MyAction(info));
console.log(action.status.hasFinishedMethodBefore);
console.log(action.status.hasFinishedMethodReduce);
console.log(action.status.hasFinishedMethodAfter);
```

## Use cases

The action status is useful mainly in testing and debugging scenarios.
In production code, you are usually more interested in the state change that the action caused,
rather than the action status.

However, one possible use case in production is taking some action only if the action completed.

As an example, suppose you want to save some info,
and you want to leave the current screen if and only if the save process succeeded.

You could have the following save action:

```ts
class SaveAction extends Action {     
  async reduce() {
    let isSaved = await saveMyInfo(); 
    if (!isSaved) throw new UserException('Save failed');	 
    return null;
  }
}
```

Then, in your widget, you can write:

```ts
let status = await dispatchAndWait(SaveAction(info));
if (status.isCompletedOk) navigateAwayFromTheScreen();  
```
