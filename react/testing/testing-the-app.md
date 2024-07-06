---
sidebar_position: 1
---

# Dispatch, wait and expect

Async Redux's test capabilities are one of its strongest points,
making it very easy to test your app,
including both testing synchronous and asynchronous processes.

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

* [store.waitCondition](../miscellaneous/wait-for-condition#waitcondition)
* [store.waitActionCondition](../miscellaneous/wait-for-condition#waitactioncondition)
* [store.waitAllActions](../miscellaneous/wait-for-condition#waitallactions)
* [store.waitActionType](../miscellaneous/wait-for-condition#waitallactiontypes-and-waitactiontype)
* [store.waitAllActionTypes](../miscellaneous/wait-for-condition#waitallactiontypes-and-waitactiontype)
* [store.waitAnyActionTypeFinishes](../miscellaneous/wait-for-condition#waitanyactiontypefinishes)

Click on the links above to see their documentation, with examples.

## Recording

It's possible to record all state changes, dispatched actions and errors thrown by actions.
Then your test checks if the recorded information is as expected.

* To start recording, call `store.record.start()`.

* To stop recording, call `store.record.stop()`.

* The recording itself is in `store.record.result` which contains an array of objects:

   ```ts
   [] as Array<{
     action: ReduxAction<St>,
     ini: boolean,
     prevState: St,
     newState: St,
     error: any,
     dispatchCount: number
   }>
   ```

* To get a text representation of the recording, call `store.record.toString()`.

For example, suppose we dispatch `SetNameAction` to put the name 'John' into the state.
Then `StartLoginAction` is dispatched to get this name and create a user from it.
Before it finishes, `StartLoginAction` dispatches `ResetNameAction` to reset the name to empty.
And finally, `StartLoginAction` finishes, adding the new user to the state.

This is how you could test this scenario using recording:

```text
it('should create user and reset name' async () => {

  const store = new Store<State>({ initialState: new State() });
  
  store.record.start();

  await store.dispatchAndWaitAll([
    new SetNameAction('John'),
    new StartLoginAction()
  ]);

  store.record.stop();

  let expected = `
  [
  1. SetNameAction ini(1): State(null, '')
  2. SetNameAction end: State(null, '') → State(null, 'John')
  3. StartLoginAction ini(2): State(null, 'John')
  4. ResetNameAction ini(3): State(null, 'John')
  5. ResetNameAction end: State(null, 'John') → State(null, '')
  6. StartLoginAction end: State(null, '') → State(User('John'), '')
  ]`;

  expect(store.record.toString()).toBe(expected);
});
```

While in theory you can always perform your tests by recording and checking the result,
that's not recommended for most cases, as those tests can be brittle and hard to maintain.

For example, the above actions could be better tested like this:

```text
it('should create user and reset name' async () => {

  const store = new Store<State>({ initialState: new State() });
  
  await store.dispatchAndWaitAll([
    new SetNameAction('John'),
    new StartLoginAction()
  ]);

  expect(store.state.user).toBe(User('John'));
  expect(store.state.name).toBe('');
});
```

It's recommended to use recording only where it's hard to test the end state directly.
