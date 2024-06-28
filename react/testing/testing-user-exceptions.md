---
sidebar_position: 6
---

# Testing UserExceptions

As previously discussed, when an action encounters an error which is not a bug, 
but rather a user mistake, it can throw the built-in `UserException` error. 

This page discusses how to test when `UserException`s are thrown.

For example, suppose you want to test that users are warned 
if they typed letters in some field that only accepts numbers. 
To that end, your test would dispatch the appropriate action, wait for it
to finish, and then check the [action.status](../advanced-actions/action-status) field.

The status can tell us if the action finished with or without errors:

* `status.isCompleted` is `true` if the action finished, and `false` if the action is still running,
  or if it hasn't been dispatched yet.

* `status.isCompletedOk` is `true` if the action finished without errors (in more detail, if the
  action's methods `before` and `reduce` finished without throwing any errors).

* `status.isCompletedFailed` is equal to `!status.isCompletedOk`.

And then, there are two errors we can read:

* `status.originalError` is the error that was originally thrown by the action's `before`
  or `reduce` methods. However, this error might have been changed by the action itself, by the
  action's `wrapError()` method.

* `status.wrappedError` is the error that was thrown by the action's `before` or `reduce` methods,
  after being changed by the action itself, by the action's `wrapError()` method.
  If the action didn't change the error, `status.originalError` and `status.wrappedError` will be
  the same.

Since the `action.status` field is immutable, the whole field will be replaced during the action 
lifecycle. This means your test needs to wait until the action is finished before getting 
a copy of its status.

Here's an example:

```ts
let status = await store.dispatchAndWait(MyAction());
expect(status.isCompletedFailed).toBe(true);

let error = status.wrappedError; 
expect(error).toBeInstanceOf(UserException);
expect(error.msg).toBe("You can't do this.");
```

## Checking the error queue

Since `UserException`s don't represent bugs in the code, Async Redux puts them into the
store's `errors` queue. In other words, this queue is a list of `UserException`s that were thrown
by actions, and it will be consumed by the UI (usually a modal error dialog) to show the user.

If you test includes actions that emit a lot of `UserException` errors,
you may wait until they all enter the error queue, and then check the queue itself:

```ts
let status = await store.dispatchAndWaitAll([
  new MyAction1(), 
  new MyAction2(), 
  new MyAction3()
]);

let errors = store.errors;

expect(errors.length).toBe(3);
expect(errors[0].msg).toBe("You can't do this.");
expect(errors[1].msg).toBe("You can't do that.");
expect(errors[2].msg).toBe("You can't do the other thing.");
```

 
