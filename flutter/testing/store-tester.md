---
sidebar_position: 20
---

# StoreTester (deprecated)

For **almost all tests** it's now recommended to use the `Store` directly, 
as shown [here](./dispatch-wait-and-expect).

Keep on reading only if you have to maintain older/deprecated code that still uses 
the old `StoreTester`.

## Introduction

Start by creating the store-tester from a store:

```dart
var store = Store<AppState>(initialState: AppState.initialState());
var storeTester = StoreTester.from(store);
```

Or else, creating it directly from `AppState`:

```dart
var storeTester = StoreTester<AppState>(initialState: AppState.initialState());
```

Then, dispatch some action, wait for it to finish, and check the resulting state:

```dart
storeTester.dispatch(SaveNameAction("Mark"));
TestInfo<AppState> info = await storeTester.wait(SaveNameAction);
expect(info.state.name, "Mark");
```

or

```dart
TestInfo<AppState> info = storeTester.dispatchAndWait(SaveNameAction("Mark")); 
expect(info.state.name, "Mark");
```

The variable `info` above will contain information about after the action reducer finishes
executing, **no matter if the reducer is sync or async**.

The `TestInfo` instance contains the following:

* `state`: The store state.
* `action`: The dispatched Action that resulted in that state.
* `ini`: A boolean which indicates true if this info represents the "initial" state right before the
  action is dispatched, or false it represents the "end" state right after the action finishes
  executing.
* `dispatchCount`: The number of dispatched actions so far.
* `reduceCount`: The number of reduced states so far.
* `errors`: The `UserException`s the store was holding when the information was gathered.

While the above example demonstrates the testing of a simple action, real-world apps have actions
that dispatch other actions. You may use different `StoreTester` methods to check if the expected
actions are dispatched, and test their intermediary states.

Let's see all the available methods of the `StoreTester`:

1. `Future<TestInfo> wait(Type actionType)`

   Expects **one action** of the given type to be dispatched, and waits until it finishes. Returns
   the info after the action finishes. Will fail with an exception if an unexpected action is seen.

2. `Future<TestInfo> waitUntil(Type actionType)`

   Runs until an action of the given type is dispatched, and then waits until it finishes. Returns
   the info after the action finishes.
   **Ignores other** actions types.

3. `Future<TestInfo> waitUntilAll(List<Type> actionTypes)`

   Runs until all actions of the given types are dispatched and finish, in any order. Returns a list
   with all info until the last action finishes. **Ignores other** actions types.

4. `Future<TestInfo> waitUntilAllGetLast(List<Type> actionTypes)`

   Runs until all actions of the given types are dispatched and finish, in any order. Returns the
   info after they all finish. **Ignores other** actions types.

5. `Future<TestInfo> waitUntilAction(ReduxAction action)`

   Runs until the exact given action is dispatched, and then waits until it finishes. Returns the
   info after the action finishes. **Ignores other** actions.

6. `Future<TestInfo> dispatchAndWait(ReduxAction action)`

   Dispatches the given action, then waits until it finishes. Returns the
   info after the action finishes. **Ignores other** actions.

7. `Future<TestInfo> waitAllGetLast(List<Type> actionTypes, {List<Type> ignore})`

   Runs until **all** given actions types are dispatched, **in order**. Waits until all of them are
   finished. Returns the info after all actions finish. Will fail with an exception if an unexpected
   action is seen, or if any of the expected actions are dispatched in the wrong order. To ignore
   some actions, pass them to the `ignore` list.

8. `Future<TestInfo> waitAllUnorderedGetLast(List<Type> actionTypes, {List<Type> ignore})`

   Runs until **all** given actions types are dispatched, in **any order**. Waits until all of them
   are finished. Returns the info after all actions finish. Will fail with an exception if an
   unexpected action is seen. To ignore some actions, pass them to the `ignore` list.

9. `Future<TestInfoList> waitAll(List<Type> actionTypes, {List<Type> ignore})`

   The same as `waitAllGetLast`, but instead of returning just the last info, it returns a list with
   the end info for each action. To ignore some actions, pass them to the `ignore` list.

10. `Future<TestInfoList> waitAllUnordered(List<Type> actionTypes, {List<Type> ignore})`

    The same as `waitAllUnorderedGetLast`, but instead of returning just the last info, it returns a
    list with the end info for each action. To ignore some actions, pass them to the `ignore` list.

11. `Future<TestInfoList<St>> waitCondition(StateCondition<St> condition, {bool testImmediately = true, bool ignoreIni = true})`

    Runs until the predicate function `condition` returns true. This function will receive each
    testInfo, from where it can access the state, action, errors etc. When `testImmediately` is
    true (the default), it will test the condition immediately when the method is called. If the
    condition is true, the method will return immediately, without waiting for any actions to be
    dispatched. When `testImmediately` is false, it will only test the condition once an action is
    dispatched. Only END states will be received, unless you pass `ignoreIni` as false. Returns a
    list with all info until the condition is met.

12. `Future<TestInfo<St>> waitConditionGetLast(StateCondition<St> condition, {bool testImmediately = true, bool ignoreIni = true})`

    Runs until the predicate function `condition` returns true. This function will receive each
    testInfo, from where it can access the state, action, errors etc. When `testImmediately` is
    true (the default), it will test the condition immediately when the method is called. If the
    condition is true, the method will return immediately, without waiting for any actions to be
    dispatched. When `testImmediately` is false, it will only test the condition once an action is
    dispatched. Only END states will be received, unless you pass `ignoreIni` as false. Returns the
    info after the condition is met.

13. `Future<TestInfoList<St>> waitUntilError({Object error, Object processedError})`

    Runs until after an action throws an error of this exact type, or this exact error (using
    equals). You can also, instead, define `processedError`, which is the error after wrapped by the
    action's `wrapError()` method. Returns a list with all info until the error condition is met.

14. `Future<TestInfo> waitUntilErrorGetLast({Object error, Object processedError})`

    Runs until after an action throws an error of this exact type, or this exact error (using
    equals). You can also, instead, define `processedError`, which is the error after wrapped by the
    action's `wrapError()` method. Returns the info after the condition is met.

15. `Future<TestInfo<St>> dispatchState(St state)`

    Dispatches an action that changes the current state to the one provided by you. Then, runs until
    that action is dispatched and finished (ignoring other actions). Returns the info after the
    action finishes, containing the given state.

Some of the methods above return a list of type `TestInfoList`, which contains the step by step
information of all the actions. You can then query for the actions you want to inspect. For example,
suppose an action named `IncrementAndGetDescriptionAction` calls another 3 actions. You can assert
that all actions are called in order, and then get the state after each one of them have finished,
all at once:

```dart
var storeTester = StoreTester<AppState>(initialState: AppState.initialState());
expect(storeTester.state.counter, 0);
expect(storeTester.state.description, isEmpty);

storeTester.dispatch(IncrementAndGetDescriptionAction());

TestInfoList<AppState> infos = await storeTester.waitAll([
   IncrementAndGetDescriptionAction,
   BarrierAction,
   IncrementAction,
   BarrierAction,
]);

// Modal barrier is turned on (first time BarrierAction is dispatched).
expect(infos.get(BarrierAction, 1).state.waiting, true);

// While the counter was incremented the barrier was on.
expect(infos[IncrementAction].waiting, true);

// Then the modal barrier is dismissed (second time BarrierAction is dispatched).
expect(infos.get(BarrierAction, 2).state.waiting, false);

// In the end, counter is incremented, description is created, and barrier is dismissed.
var info = infos[IncrementAndGetDescriptionAction];
expect(info.state.waiting, false);
expect(info.state.description, isNotEmpty);
expect(info.state.counter, 1);
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/test/main_before_and_after_STATE_test.dart">
Testing with the Store Listener</a>.

Also,
the <a href="https://github.com/marcglasberg/async_redux/blob/master/test/store_tester_test.dart">
tests of the StoreTester</a> can also serve as examples.

**Important:** The `StoreTester` has access to the current store state via `StoreTester.state`, but
you should not try to assert directly from this state. This would seem to work most of the time, but
by the time you do the assert, the state could already have been changed by some other action. To
avoid that, always assert from the `info` you get from the `StoreTester` methods, which is
guaranteed to be the one right after your *wait condition* is achieved. For example:

```dart
// This is right:
TestInfo<AppState> info = await storeTester.wait(SaveNameAction);
expect(info.state.name, "Mark");

// This is wrong:
await storeTester.wait(SaveNameAction);
expect(storeTester.state.name, "Mark");
```       

However, to help you further reduce your test boilerplate, the last `info`
obtained from the most recent wait condition is saved into a variable called `storeTester.lastInfo`:

```dart
// This:
TestInfo<AppState> info = await storeTester.wait(SaveNameAction);
expect(info.state.name, "Mark");

// Is the same as this:
await storeTester.wait(SaveNameAction);
expect(storeTester.lastInfo.state.name, "Mark");
``` 

## Testing UserExceptions

Since `UserException`s don't represent bugs in the code, Async Redux puts them into the
store's `errors` queue, and then swallows them. This is usually what you want during production,
where errors from this queue are shown in a dialog to the user.
But it may or may not be what you want during tests.

In tests there are two possibilities:

1. You are testing that some `UserException` is thrown. For example, you want to test that users are
   warned if they typed letters in some field that only accepts numbers. To that end, your test
   would dispatch the appropriate action, and then check if the `errors` queue now contains
   a `UserException` with some specific error message.

2. You are testing some code that should **not** throw any exceptions. If the test has thrown an
   exception it means the test has failed, and the exception should show up in the console, for
   debugging. However, this won't work if when test throws a `UserException` it simply go to
   the `errors` queue. If this happens, the test will continue running, and may even pass. The only
   way to make sure no errors were thrown would be asserting that the `errors` queue is still empty
   at the end of the test. This is even more problematic if the unexpected `UserException` is thrown
   inside a `before()` method. In this case it will prevent the reducer to run, and the test will
   probably fail with wrong state but no errors in the console.

The solution is to use the `shouldThrowUserExceptions` parameter in the `StoreTester` constructor.

Pass `shouldThrowUserExceptions` as `true`, and all errors will be thrown and not swallowed,
including `UserException`s. Use this in all tests that should throw no errors:

```dart
var storeTester = StoreTester<AppState>(
                     initialState: AppState.initialState(), 
                     shouldThrowUserExceptions: true);
```

Pass `shouldThrowUserExceptions` as false (the default)
when you are testing code that should indeed throw `UserExceptions`. These exceptions will then
silently go to the `errors` queue, where you can assert they exist and have the right error
messages:

```dart
storeTester.dispatch(MyAction());
TestInfo info = await storeTester.waitAllGetLast([MyAction]);
expect(info.errors.removeFirst().msg, "You can't do this.");
```
