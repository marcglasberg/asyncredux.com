---
sidebar_position: 9
---

# Dispatching actions

As discussed, the only way to change the application state is by **dispatching actions**.

The two places where you usually dispatch actions from are:

* From a widget, using the dispatch extension methods on the widget's `context`
  (more on that later).
* From an action, dispatching other actions. All actions have access to the dispatch methods.

There are five "dispatch methods" that you can choose from. Let's study them in detail.

## 1. Dispatch

The most common dispatch method is `dispatch()`. It will dispatch the action and return
immediately. If the action is sync, the state will be updated before the method returns.
If the action is async, this will start an async process and the state will be updated eventually
when the action completes.

```dart
dispatch(MyAction());
```

## 2. DispatchAndWait

Method `dispatchAndWait()` returns a `Future` that completes only when the action finishes **and the state changes**.
This works whether the action is sync or async.

```dart
await dispatchAndWait(MyAction());
```

## 3. DispatchAll

Another dispatch method is `dispatchAll([])`, which dispatches all given actions in **parallel**.

```dart
dispatchAll([
  BuyAction('IBM'), 
  SellAction('TSLA')
]);
```

Note this is similar to:

```dart
dispatch(BuyAction('IBM'));
dispatch(SellAction('TSLA'));
```

The `dispatchAll` method returns the list of dispatched actions,
so that you can instantiate them inline, but still get a list of them:

```dart
// Get a list of actions to do something with them later
var actions = dispatchAll([MyAction1(), MyAction2()]);
```

## 4. DispatchAndWaitAll

Method `dispatchAndWaitAll` dispatches all given actions in **parallel**, and
returns a `Future` that completes only when **all** action finish **and the state changes**.
This works whether the actions are sync, async, or a mix of both.

```dart
await store.dispatchAndWaitAll(
  [
    BuyAction('IBM'), 
    SellAction('TSLA')
  ]
);
```

It also returns the list of dispatched actions, if needed:

```dart
var actions = await store.dispatchAndWaitAll([MyAction1(), MyAction2()]);
```

This is similar to:

```dart
var action1 = MyAction1();
var action2 = MyAction2();
dispatch(action1);
dispatch(action2);
await store.waitAllActions([action1, action2], completeImmediately = true);
var actions = [action1, action2];
```

> Note method `waitAllActions` will be discussed later.

## 5. DispatchSync

Method `dispatchSync()` works like `dispatch()`, but it throws a `StoreException` if the action is **async**.

```dart
dispatchSync(MyAction());
```

Use it only when you need to guarantee that an action is **sync** and that the state is updated before moving on.
In most cases this is unnecessary, since `dispatchAndWait()` works for both sync and async actions.

Also, when writing code you usually do not need to know if an action is sync or async, 
as it makes no difference in most cases.

## Dispatching from widgets

All dispatch methods are available in your widgets through `context` extensions:

```dart
context.dispatch(Action());
context.dispatchAll([Action1(), Action2()]);
await context.dispatchAndWait(Action());
await context.dispatchAndWaitAll([Action1(), Action2()]);
context.dispatchSync(Action());
```

For example, if a button needs to dispatch an action to increment a counter, you can do this:

```dart
Widget build(BuildContext context) {
  return ElevatedButton(
    onPressed: () => context.dispatch(Increment()), // Here!
    child: Text('Increment'),
  );
```

## Action status

Some of the dispatch methods return an `ActionStatus` (or a future of it),
which contains some useful information about the action.
This will be [covered later](../advanced-actions/action-status).

## The `notify` parameter

All dispatch methods have an optional `notify` parameter. 
When `false`, widgets will not necessarily rebuild when the action changes the state.
The default is `true`, as almost always you want widgets to rebuild.

<hr></hr>

Next, let's see how to deal with actions that fail and throw errors, and let's learn about
a special kind of error called a `UserException`.
