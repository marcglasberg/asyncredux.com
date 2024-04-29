---
sidebar_position: 7
---

# Order of execution

What's the order of execution of sync and async reducers?

A reducer is only sync if both `reduce()` return `AppState` AND `before()` return `void`. If you
any of them return a `Future`, then the reducer is async.

When you dispatch **sync** reducers, they are executed synchronously, in the order they are called.
For example, this code will wait until `MyAction1` is finished and only then run `MyAction2`,
assuming both are sync reducers:

```dart
dispatch(MyAction1()); 
dispatch(MyAction2());
```

Dispatching an async reducer without writing `await` is like starting any other async processes
without writing `await`. The process will start immediately, but you are not waiting for it to
finish. For example, this code will start both `MyAsyncAction1` and `MyAsyncAction2`, but is says
nothing about how long they will take or which one finishes first:

```dart
dispatch(MyAsyncAction1()); 
dispatch(MyAsyncAction2());
```

If you want to wait for some async action to finish, you must write `await dispatch(...)`
instead of simply `dispatch(...)`. Then you can actually wait for it to finish. For example, this
code will wait until `MyAsyncAction1` is finished, and only then run `MyAsyncAction2`:

```dart
await dispatch(MyAsyncAction1()); 
await dispatch(MyAsyncAction2());
```
