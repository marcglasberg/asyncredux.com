---
sidebar_position: 8
---

# Dispatching Actions

As discussed, the only way to change the store state is by **dispatching actions**.

The two places where you usually dispatch actions from are:

* From inside a widget, using the dispatch extension methods on the widget `context` (more on that
  later).
* From inside actions dispatching other actions. All actions have access to the dispatch methods.

There are five "dispatch methods" that you can choose from. Let's study them in detail.

## 1. Dispatch

The most common one is simply `dispatch(MyAction())`. This will dispatch the action and return
immediately. If the action is sync, the state will be updated before the method returns.
If the action is async, this will start an async process and the state will be updated eventually
when the action completes.

## 2. DispatchAndWait

Another dispatch method is `dispatchAndWait(MyAction())`. This is similar to `dispatch()`, but it
will return a `Future` that completes when the action is done. This is useful if you want to wait
for the action to complete and change the state before continuing, no matter if the action is sync
or async:

```dart
await dispatchAndWait(MyAction());
print('Action completed');
```

## 3. DispatchAll

Another dispatch method is `dispatchAll([])`, which dispatches all given actions in **parallel**,
applying their reducer, and possibly changing the store state. For example:

```dart
dispatchAll([
  BuyAction('IBM'), 
  SellAction('TSLA')
]);
```

Note this is very similar to:

```dart
dispatch(BuyAction('IBM'));
dispatch(SellAction('TSLA'));
```

Moreover, the `dispatchAll` method returns the list of dispatched actions,
so that you can instantiate them inline, but still get a list of them:

```dart
// Get a list of actions do to something with them later
var actions = dispatchAll([MyAction1(), MyAction2()]);
```

## 4. DispatchAndWaitAll

Another dispatch method is `dispatchAndWaitAll`, which dispatches all given actions in **parallel**,
applying their reducers, and possibly changing the store state. The actions may be sync or async.

It returns a `Future` that resolves when **all** actions finish, which means you can await it:

```dart
await store.dispatchAndWaitAll(
  [
    BuyAction('IBM'), 
    SellAction('TSLA')
  ]
);
```

> Note: While the state change from the actions' reducers will have been applied when the
> Future resolves, other independent processes that the action may have started may still
> be in progress.

It also returns the list of dispatched actions, if you need it:

```dart
var actions = await store.dispatchAndWaitAll([MyAction1(), MyAction2()]);
```

This is very similar to:

```dart
var action1 = MyAction1();
var action2 = MyAction2();
dispatch(action1);
dispatch(action2);
await store.waitAllActions([action1, action2], completeImmediately = true);
var actions = [action1, action2];
```

Note we haven't discussed `waitAllActions` yet, but it's a method that waits for a list of actions
to complete. Just ignore it for now.

## 5. DispatchSync

The last dispatch method is `dispathSync(MyAction())`. This is similar to `dispatch()`, but it
will throw a `StoreException` if the action is **async**.

This is useful if you want to ensure that the action is sync and that the state is updated before
continuing. In practice this is rarely needed, because you can always use `dispatchAndWait()`
irrespective of the action being sync or async.

Also, as you'll see in practice, knowing if the action is sync or async when you dispatch it is not
very useful anyway, because things just work without you having to pay attention to this detail.

## Dispatching from widgets 

It's easy to access all dispatch methods from inside your widgets, as Async Redux defines
an extension on `context`.

Suppose a button in your widget needs to dispatch an action to increment
a counter. This is how you can do it:

```dart
class MyWidget extends StatelessWidget {  
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => context.dispatch(IncrementAction()),
      child: Text('Increment'),
    );
}
```

You have access to all dispatch methods:

```dart
context.dispatch(MyAction());
context.dispatchAll([MyAction1(), MyAction2()]);
await context.dispatchAndWait(MyAction());
await context.dispatchAndWaitAll([MyAction1(), MyAction2()]);
context.dispatchSync(MyAction());
```

## Action status

Some of the above dispatch methods return an `ActionStatus` (or a future of it),
which contains some useful information about the action. This is an advanced feature that you can
ignore for now.

## The `notify` parameter

All dispatch methods have an optional `notify` parameter. If you pass `false`, widgets will not
necessarily rebuild because of the dispatched action, even if it changes the state.
The default is `true` as almost always you do want the widgets to rebuild, in which case you can
safely ignore this parameter.

<hr></hr>

Next, let's see how to access the dispatch methods (and more) from inside your widgets, using the
widget's `BuildContext`.
