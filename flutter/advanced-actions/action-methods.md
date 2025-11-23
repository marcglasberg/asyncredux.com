---
sidebar_position: 1
---

# ReduxAction 
   
All actions you create must extend `ReduxAction`, 
which comes with a lot of useful fields and methods, 
that you can use to interact with the store and the action lifecycle.

### Most important ones are:

* `state` - Returns current state in the store. This is a getter, and can change after every await, for async actions.
* `reduce` - The action reducer that returns the new state. Must be overridden.
* `dispatch` - Dispatches an action (sync or async).
* `dispatchAndWait` - Dispatches an action and returns a `Future` that resolves when it finishes.
* `isWaiting` - Checks if one or more async actions are currently being processed.
* `isFailed` - Returns true if an action failed with a `UserException`.

### Then, there are many other useful fields and methods:

* `store` - Returns the store instance.
* `before` - Overridable method that runs before `reduce` during action dispatching.
* `after` - Overridable method that runs after `reduce` during action dispatching.
* `wrapError` - Overridable method that catches or modifies errors thrown by `reduce` or `before` methods.
* `dispatchAndWaitAll` - Dispatches multiple actions in parallel and waits for all to finish.
* `dispatchAll` - Dispatches multiple actions in parallel.
* `dispatchSync` - Dispatches a sync action, throws if the action is async.
* `exceptionFor` - Returns the `UserException` of the action that failed.
* `clearExceptionFor` - Removes the given action type from the failed actions list.
* `initialState` - Returns the state as it was when the action was dispatched. This does NOT change.
* `waitCondition` - Returns a future that completes when the given state condition is true.
* `waitAllActions` - Returns a future that completes when all given actions finish.
* `status` - Returns the current status of the action (waiting, failed, completed, etc.).
* `prop` - Gets a property from the store (timers, streams, etc.).
* `setProp` - Sets a property in the store.
* `disposeProp` - Disposes a single property by its key.
* `disposeProps` - Disposes all or selected properties (timers, streams, futures).
* `env` - Gets the store environment, useful for global values scoped to the store.
* `microtask` - Returns a future that completes in the next microtask.
* `assertUncompletedFuture` - Asserts that an async reducer has at least one await.

### Finally, these are one-off methods that you may use in special situations:

* `stateTimestamp` - Returns the timestamp of the last state change.
* `wrapReduce` - Wraps the `reduce` method for pre- / post-processing.
* `abortDispatch` - Returns true to abort the action dispatch before it runs.
* `isSync` - Returns true if the action is sync, false if async.
* `ifWrapReduceOverridden_Sync` - Returns true if `wrapReduce` is overridden synchronously.
* `ifWrapReduceOverridden_Async` - Returns true if `wrapReduce` is overridden asynchronously.
* `ifWrapReduceOverridden` - Returns true if `wrapReduce` is overridden (sync or async).
* `runtimeTypeString` - Returns the `runtimeType` without the generic part.
