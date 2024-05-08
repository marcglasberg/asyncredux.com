---
sidebar_position: 1
---

# Dispatch, wait and expect

Testing an Async Redux app generally involves these steps, in order:

1. Set up the store and some initial state.
2. Dispatch an action.
3. Wait for the action to complete its dispatch process, or for the store state to meet
   a certain condition.
4. Verify the current state, or the action status.

Item 3 above can be done using one the following methods:

## `store.dispatchAndWait`

This method returns a future that resolves when the action finishes.
This is useful because, after the future completes,
you can check the resulting state.

```dart
// Wait for some action to dispatch and check the state. 
await store.dispatchAndWait(MyAction());
expect(store.state.name, 'John')
```

Waiting for this future to complete also allows you to dispatch another action only after
the first action finishes. In other words, it allows you to dispatch actions in **series**.

```dart
// Dispatches two actions in SERIES (one after the other).
await dispatchAndWait(SomeAsyncAction());
await dispatchAndWait(AnotherAsyncAction());
```

The method also returns the action **status**, which you can use to check for errors
thrown by the action.

```dart
// Wait for some action to dispatch, 
// and check for errors in the action status. 
var status = await dispatchAndWait(MyAction());
expect(status.originalError, isA<UserException>());
```

## `store.dispatchAndWaitAll`

This method dispatches all given actions in **parallel**, applying their reducers, and possibly
changing the store state. It returns a future that resolves only when **all** actions finish.

```dart
// Dispatch two actions in PARALLEL and wait for them.
await store.dispatchAndWaitAll([
  BuyAction('IBM'), 
  BuyAction('TSLA')
]);

expect(
  store.state.portfolio.containsAll('IBM', 'TSLA'), 
  isFalse
);
```

## `store.waitCondition`

This method returns a future which will complete when the given state `condition` is true.
The condition is a function that gets the state and returns `true` or `false`.

```dart
// Wait for some state condition.
expect(store.state.name, 'John')               
dispatch(ChangeNameAction("Bill"));

var action = await store.waitCondition(
   (state) => state.name == "Bill"
);
   
expect(action, isA<ChangeNameAction>());
expect(store.state.name, 'Bill');
```

## `store.waitActionCondition`

This method returns a future which will complete when some actions meet the given state `condition`.

The `condition` is a function that takes the set of all actions "in progress",
as well as an action that triggered the condition by entering the set (just been dispatched)
or left the set (just finishing dispatching):

```dart
bool Function(
  Set<ReduxAction<St>> actions, // All current actions in progress. 
  ReduxAction<St>? triggerAction // The action that triggered the condition.
) condition { ... }
```

The function should return `true` when the condition is met, and `false`
otherwise.

## `store.waitAllActions`

Returns a future that completes when **all** given actions finish dispatching.

However, if you don't provide any actions (empty list or `null`), the future will complete
when all current actions in progress finish dispatching. In other words, when no actions are
currently in progress.

```dart
// Dispatches two actions in PARALLEL and wait for them.
let action1 = BuyAction('IBM');
let action2 = BuyAction('TSLA');

dispatch(action1);
dispatch(action2);

await store.waitAllActions([action1, action2]);

expect(
  store.state.portfolio.containsAll('IBM', 'TSLA'), 
  isFalse
);
```

```dart
// Wait until no actions are in progress anymore.
dispatch(BuyStock('IBM'));
dispatch(BuyStock('TSLA')); 
 
await waitAllActions([]);
                 
expect(state.stocks, ['IBM', 'TSLA']);
```

## `store.waitActionType`

This method returns a future that completes when an action of the given type in **not** in
progress (it's not being dispatched).

```dart
// Wait for some action of a given type.
dispatch(ChangeNameAction());
 
var action = store.waitActionType(ChangeNameAction);

expect(action, isA<ChangeNameAction>());
expect(action.status.isCompleteOk, isTrue);
expect(store.state.name, 'Bill');
```

## `store.waitAllActionTypes`

This method returns a future that completes when **all** actions of the given types are **not** in
progress (none of them are being dispatched).

```dart
// Dispatches two actions in PARALLEL and wait for their TYPES.

// Check the initial state.
expect(store.state.portfolio, ['TSLA']);

dispatch(BuyAction('IBM'));
dispatch(SellAction('TSLA'));

await store.waitAllActionTypes([BuyAction, SellAction]);

// Check the final state.
expect(store.state.portfolio, ['IBM']);               
```

## `store.waitAnyActionTypeFinishes`

Returns a future which will complete when **any** action of the given types **finishes**
dispatching.

IMPORTANT: This method is different from the other similar methods, because
it does NOT complete immediately if no action of the given types is in progress.
Instead, it waits until an action of the given types finishes dispatching, even if they
were not yet in progress when the method was called.

This method returns the action that completed the future, which you can use to check
its `status`.

It's useful when the actions you are waiting for are not yet dispatched when you call this
method. For example, suppose action `StartAction` starts a process that takes some time
to run and then dispatches an action called `MyFinalAction`. You can then write:

```dart
dispatch(StartAction());
var action = await store.waitAnyActionTypeFinishes([MyFinalAction]);
expect(action.status.originalError, isA<UserException>());
```

Another example:

```dart
dispatch(BuyOrSellAction());

// Wait until any action of the given types finishes dispatching.   
var action = store.waitAnyActionTypeFinishes([
  BuyAction, 
  SellAction
]);
  
expect(store.state.portfolio.contains('IBM'), isTrue);
```

# Complete immediately

Most methods above allow you to provide a `completeImmediately` parameter:

* If `true` and the condition was already true when the method was called,
  the future will complete immediately and throw no errors.

* If `false` and the condition was already true when
  the method was called, it will throw a `StoreException`.

Please check each method's documentation for more details, and in special if the parameter's
default for each of them is true or false. Also check their return values: When the methods do not
complete immediately, they may return more information, like for example, a reference to the
dispatched action that triggered the condition, just in case you need to check the action's type or
status.

# Timeout

Most methods above allow you to provide a `timeoutMillis` parameter, which by default is 10 minutes.
To disable the timeout, make it equal to `-1`.

If you want, you can also modify the static value `Store.defaultTimeoutMillis` to change the
default timeout for all methods.
