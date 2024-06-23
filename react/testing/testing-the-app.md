---
sidebar_position: 1
---

# Dispatch, wait and expect

Async Redux test features are one of the strongest points of the package,
making it very easy to test your app, including both synchronous and asynchronous
processes.

## Testing steps

Testing an Async Redux app generally involves these steps, in order:

1. Set up the store and some initial state.
2. Dispatch one or more actions.
3. Wait for the actions to complete their dispatch, or for the store state to meet
   a certain condition.
4. Verify the current state, or the action status.

Item 3 above (waiting for actions to complete) can be done using the following functions:

* [dispatchAndWait](../dispatching-actions#dispatch-and-wait)
* [dispatchAndWaitAll](../dispatching-actions#dispatch-and-wait-all)

Click on the links above to see their documentation.

Example:

```ts
// Start with some IBM stocks
var store = Store<State>(initialState: State(portfolio: ['IBM']));

// Buy Tesla stocks  
await dispatchAndWait(new BuyAction('TSLA'));  

// Assert we now have IBM and Tesla
expect(store.state.portfolio).toEqual(['IBM', 'TSLA']);
```

## How about dispatch and dispatchAll?

Functions [**dispatch**](../dispatching-actions#dispatch-one-action)
and [**dispatchAll**](../dispatching-actions#dispatch-all-multiple-actions)
can also be used to dispatch actions in tests,
but they do **not** return a `Promise` that resolves when the action finishes.

When you dispatch a **synchronous** action, the action will finish **immediately**,
because that's how JavaScript works. But when you dispatch an **asynchronous** action,
the action will finish **later**, and you may need ways to wait for it to finish.

For this reason, it's probably simpler to always use `dispatchAndWait`
and `dispatchAndWaitAll` in tests.
They will always work no matter if actions are sync or async,
whether you want to wait for them to finish or not.

## Waiting for conditions

Besides the simple use cases above, where you dispatch actions directly and wait for them to finish,
the following functions can be used to wait for more complex conditions to be met:

* [store.waitCondition](../wait-for-condition#waitcondition)
* [store.waitActionCondition](../wait-for-condition#waitactioncondition)
* [store.waitAllActions](../wait-for-condition#waitallactions)
* [store.waitActionType](../wait-for-condition#waitallactiontypes-and-waitactiontype)
* [store.waitAllActionTypes](../wait-for-condition#waitallactiontypes-and-waitactiontype)
* [store.waitAnyActionTypeFinishes](../wait-for-condition#waitanyactiontypefinishes)

Click on the links above to see their documentation, with examples.

