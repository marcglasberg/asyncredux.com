---
sidebar_position: 6
---

# Dispatching actions

As [previously discussed](./store-and-state#immutable-state), the store state is **immutable**.

The only way to change the store **state** is by dispatching **actions**.
The action reducer returns a new state, that replaces the old one.

## Dispatch (one action)

```tsx
// Dispatch an action
store.dispatch(new Increment());
```

In more detail, this is what Async Redux does when you dispatch an action:

1. The current state is injected into the action object.
2. The action reducer (its `reduce()` function) is called.
3. The reducer returns a new, modified state.
4. The new state replaces the old one.
5. All components that use the state are rebuilt.

## Dispatch all (multiple actions)

If you want to dispatch more than one action in **parallel** at a time, you can use `dispatchAll`.
Using `dispatchAll` is the same as calling `dispatch` multiple times:

```tsx
// Dispatch multiple actions
store.dispatchAll([new Increment(), new LoadText()]);

// Same as dispatching an action multiple times
store.dispatch(new Increment());
store.dispatch(new LoadText());
```

Note it only makes sense to say the actions will run in parallel when they are asynchronous.
If they are sync, they will run one after the other, naturally.

## Dispatch and wait

You can use `dispatchAndWait` to dispatch an action and get back a promise that resolves when the
action finishes. This works with both sync and async actions:

```tsx
// Dispatch an action and wait for it to finish
await store.dispatchAndWait(new Increment());
```

The state change from the action's reducer will have been applied when the promise
resolves, and it will return the action **status**,
which you can use to check if the action was successful or not.

For example, suppose you want to dispatch an action,
but only after a previous action has finished successfully:

```tsx
var status 
  = await store.dispatchAndWait(new BuyAction('IBM'));

if (status.isCompletedOk()) {
  await store.dispatch(new UpdateBalanceAction());
}
```

The status is also useful in tests, to make sure some action is successful:

```tsx
var status = await store.dispatchAndWait(new MyAction());
expect(status.isCompletedOk()).toBe(true);
```

Or to make sure some action throws an error:

```tsx
var status = await store.dispatchAndWait(new MyAction());
expect(status.originalError).toBeInstanceOf(UserException);
```

## Dispatch and wait all

Use `dispatchAndWaitAll` to dispatch the given actions in parallel, applying their reducers,
and possibly changing the store state.

The actions may be sync or async. You'll get a `Promise` that resolves when **all** actions finish.
In other words, it waits for the slowest action to finish.
The state change from all action's reducers will have been applied when the Promise resolves.

```tsx
await store.dispatchAndWaitAll([
  new BuyAction('IBM'), new SellAction('TSLA')
]);
```

Note `dispatchAndWaitAll` returns the same list of actions you provided,
so that you can instantiate them inline, but still get a list of them.
That's usually only useful for testing. For example:

```tsx
let [buyAction, sellAction] 
  = await store.dispatchAndWaitAll([
      new BuyAction('IBM'), new SellAction('TSLA')
]);

// Test that buyAction threw an error 
expect(buyAction.status.originalError).toBeInstanceOf(UserException);

// Test that sellAction completed successfully 
expect(sellAction.status.isCompletedOk()).toBe(true)); 
```

## Dispatch sync

Using `dispatchSync` is exactly the same as using the regular `dispatch`,
except for the fact it will throw a `StoreException` if the action is **asynchronous**.

Note an action is async if any of its `reduce()` or `before()` methods return a `Promise`.

The only use for `dispatchSync` is when you need to guarantee (in runtime) that your
action is **sync**, which means the state gets changed right after the dispatch call.

Making sure some action you're dispatching is synchronous is usually not a very useful feature,
but it's there if you need it, especially for testing.
             
## Actions can dispatch other actions

You can use dispatch actions from inside other actions. The dispatch functions are available
in the action object, so you can call them directly, by using `this.dispatch()` etc.

For example:

```dart
class LoadTextAndIncrement extends Action {

  async reduce() {
  
    // Dispatch and wait for the action to finish   
    await this.dispatchAndWait(new LoadText());
    
    // Only then, increment the state
    return (state) => state.copy({count: state.count + 1});  
  }
}
```

<hr></hr>
