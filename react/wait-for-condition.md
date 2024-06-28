---
sidebar_position: 11
---

# Wait for condition

Async Redux comes with a few functions to help you wait until some condition is met.
You can create conditions that wait until the store state is in a certain way,
or until actions in progress are in a certain way.

* [waitCondition](#waitcondition) waits until the state is in a condition.
* [waitAllActions](#waitallactions) waits until actions are not in progress.
* [waitAllActionTypes](#waitallactiontypes-and-waitactiontype) waits until all action types are NOT
  in progress.
* [waitActionType](#waitallactiontypes-and-waitactiontype) waits until an action of a type is not in
  progress.
* [waitAnyActionTypeFinishes](#waitanyactiontypefinishes) waits until action types finish
  dispatching.
* [waitActionCondition](#waitactioncondition) waits until actions in progress meet a condition.

## waitCondition

You can use the `waitCondition` function to wait until the app state changes in a certain way.
In more detail, you get a promise which will resolve when a given state condition is true.

For example, suppose your state contains a `stocks` object that allows you to get the
stock price for a given stock:

```tsx
let price = state.stocks.getPrice('IBM');
```

Now suppose you want to wait until the current price of IBM is 100 or more.
This is how you can do it:

```tsx
await waitCondition(
  (state) => state.stocks.getPrice('IBM') >= 100
);
```

In actions, you can use `this.waitCondition`. For example:

```tsx
class SellStockForPrice extends Action {
  constructor(public stock: string, public price: number) { super(); }

  async reduce() {
  
    // Wait until the stock price is higher than the limit price
    await this.waitCondition(
      (state) => state.stocks.getPrice(this.stock) >= this.price
    );
    
    // Only then, post the sell order to the backend
    let amount = await postSellOrder(this.stock);    
    
    return (state) => 
      state.copy(
        stocks: state.stocks.setAmount(this.stock, amount),
      );
  }
}
```

Keep in mind you should probably avoid waiting for conditions that may take a very long time to
complete, as checking the condition is an overhead to every state change.

:::note

If the condition is already true when the `waitCondition` function is called,
the promise resolves immediately.

:::

### In tests

The `waitCondition` function is also very useful in tests.
You can dispatch actions that perform some complex stuff,
and then simply wait until the state reaches the exact condition you want to test for.

In the following example,
we dispatch a `LogInUser` action and then wait until the user is logged in:

```ts
expect(store.state.user.isLoggedIn).toBe(false);
dispatch(new LogInUser("Mary"));
await store.waitCondition((state) => state.user.isLoggedIn);
expect(store.state.user.name, "Mary");
```

Another useful fact is that the `waitCondition` function
returns you the exact action (called the "trigger action")
that changed the state to meet the condition.
This can be helpful in tests when you need to assert
the specific action that caused the state change:

```ts
let action = await store.waitCondition(
  (state) => state.name == "Bill"
);
  
expect(action instanceof ChangeNameAction).toBe(true);
```

:::tip

What happens if the condition is never met, and your test never finishes?
To prevent that, you can set the `timeoutMillis` parameter.
For example, this would time out after 1 second (1000 milliseconds):

```ts
let action = await store.waitCondition(
  (state) => state.name == "Bill",
  1000,
);
```

The default timeout is 10 minutes, but you can
modify `TimeoutException.defaultTimeoutMillis` to change this default globally.

To disable the timeout completely, make it `0` or `-1`.

:::

## waitAllActions

You can use the `waitAllActions` function to wait until no actions are in progress:

```ts
// Initially we have some IBM stocks
expect(store.state.portfolio).toEqual(['IBM']);

// We'll sell IBM and buy TSLA, dispatching actions in parallel 
dispatch(new SellAction('IBM')); 
dispatch(new BuyAction('TSLA'));  

// We wait until ALL actions finish
await store.waitAllActions([]);

// Now we should have TSLA stocks and no IBM stocks
expect(store.state.portfolio).toEqual(['TSLA']);
```

:::note

In the code above, dispatching both actions in parallel could also have been done like this:

```
dispatchAll([
  new SellAction('IBM'),
  new BuyAction('TSLA')
]);
```

:::

Instead of waiting for all actions to finish, you can wait for **specific actions** to finish.
In this case, you'll need a reference to the actions you want to wait for, before dispatching them:

```ts
// Initially we have some IBM stocks
expect(store.state.portfolio).toEqual(['IBM']);

// We'll sell IBM and buy TSLA, dispatching actions in parallel 
var action1 = new SellAction('IBM');
var action2 = new BuyAction('TSLA');
dispatchAll([action1, action2]);

// We wait until both actions finish
await store.waitAllActions([action1, action2]);

// Now we should have TSLA stocks and no IBM stocks
expect(store.state.portfolio).toEqual(['TSLA']);
```

Note, in this case we could have used `dispatchAndWaitAll` instead:

```ts
// Initially we have some IBM stocks
expect(store.state.portfolio).toEqual(['IBM']);

// We'll sell IBM and buy TSLA, dispatching actions in parallel,
// and then wait until both actions finish 
await dispatchAndWaitAll([
  new SellAction('IBM'), 
  new BuyAction('TSLA')
]);

// Now we should have TSLA stocks and no IBM stocks
expect(store.state.portfolio).toEqual(['TSLA']);
```

Or, if we don't mind that the actions run in **series**
(one after the other, instead of running in parallel),
we could have used `dispatchAndWait`:

```ts
// Initially we have some IBM stocks
expect(store.state.portfolio).toEqual(['IBM']);

// We'll sell our IBM and buy TSLA, separately, and wait for each  
await dispatchAndWait(new SellAction('IBM')); 
await dispatchAndWait(new BuyAction('TSLA'));  

// Now we should have TSLA stocks and no IBM stocks
expect(store.state.portfolio).toEqual(['TSLA']);
```

:::warning

Only in **tests** you should use `waitAllActions([])` to wait until **no actions** are in progress.
Do not use it in production, because it can easily cause a deadlock. In tests it's acceptable,
because the test will fail and you can set a timeout.

However, you can use something like `waitAllActions([myAction])` in production,
to wait for **specific actions** to finish.
That's safe in production, as long as you're waiting for actions you just dispatched.

:::

When the promise resolves, you get back the set of actions being dispatched that met the condition,
as well as the action that triggered the condition by being added or removed from the set.

## waitAllActionTypes and waitActionType

You can use the `waitAllActionTypes` function to wait until **all** actions of the given **type**
are not in progress:

- If **no** action of the given types is currently in progress when the function is called,
  and parameter `completeImmediately` is `false` (the default), this function will throw an error.

- If **no** action of the given type is currently in progress when the function is called, and
  parameter `completeImmediately` is `true`, the promise completes immediately and throws no error.

- If **any** action of the given types is in progress, the promise completes only when
  no action of the given types is in progress anymore.

For example:

```ts
// Initially we have some IBM stocks
expect(store.state.portfolio).toEqual(['IBM']);

// We'll sell our IBM and buy TSLA
dispatch(new SellAction('IBM'));
dispatch(new BuyAction('TSLA'));

// We wait until the above action types finish
await store.waitAllActionTypes([BuyAction, SellAction]);

// Now we should have TSLA stocks and no IBM stocks
expect(store.state.portfolio).toEqual(['TSLA']);
```

The `waitActionType` function is very similar to the above `waitAllActionTypes`,
but it waits for a single action type.
The important difference is that it returns the action that caused the condition to be met.
You can use this returned action to check its `status`, for example, to assert it failed:

```ts
var action = await store.waitActionType(MyAction);
expect(action.status.isCompleteOk).toBe(false);
expect(action.status.isCompleteFailed).toBe(true);
expect(action.status.originalError, isA<UserException>());
```

## waitAnyActionTypeFinishes

You can use the `waitAnyActionTypeFinishes` function to wait until **any** action of the given
types **finishes dispatching**.

This function is different from the other similar functions above, because
it does NOT complete immediately if no action of the given types is in progress. Instead,
it waits until an action of the given types finishes
dispatching, **even if they were not yet in progress when the function was called**.

It's useful when the actions you are waiting for are not yet dispatched when you call this
function. For example, suppose action `StartAction` starts a complex process that takes some time
to run and then eventually dispatches an action called `MyFinalAction`.

In this case, you can use `waitAnyActionTypeFinishes` to wait for `MyFinalAction` to
eventually dispatch and finish:

```dart
dispatch(StartAction());
await store.waitAnyActionTypeFinishes([MyFinalAction]);
```

This function also returns the action that completed the promise,
which you can use to check its `status`.
For example, if you want to assert that `MyFinalAction` failed by throwing a `UserException`:

```dart
dispatch(StartAction());
let action = await store.waitAnyActionTypeFinishes([MyFinalAction]);
expect(action.status.isCompleteOk).toBe(false);
expect(action.status.isCompleteFailed).toBe(true);
expect(action.status.originalError).toBeInstanceOf(UserException>);
```

## waitActionCondition

You can use the `waitActionCondition` function to wait until the set of actions in progress,
and the trigger action, meet the given condition.
The condition function should return `true` when the condition is met, and `false` otherwise:

```ts
await store.waitActionCondition(
  (actionsInProgress, triggerAction) => { // Return true or false }
);
```

The trigger action is the action that just entered the set (by being dispatched),
or just left the set (by finishing dispatching).

:::note

The condition is only checked when some action is dispatched or finishes dispatching.
It's not checked every time action statuses change.

:::

When the promise resolves, you get back the set of actions being dispatched that met the condition,
as well as the trigger action. This may be useful in tests.

:::warning

Your condition function should **not** try and modify the set of actions it got in
the `actionsInProgress` parameter. If you do, Async Redux will throw an error.

:::

## Optional parameters

Most wait functions above accept these optional parameters:

* If `completeImmediately` is false (the default),
  the function will throw an error if the condition was already true when the function was called.
  Otherwise, the promise will complete immediately and throw no errors.

* The `timeoutMillis` sets the maximum time to wait for the condition to be met.
  By default, it's 10 minutes. To disable it, make it `0` or `-1`.
  If you want, you can modify `TimeoutException.defaultTimeoutMillis` to change the default.
