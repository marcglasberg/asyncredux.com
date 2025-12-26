---
sidebar_position: 1
---

# ReduxAction

Every action you create must extend `ReduxAction`,
which comes with a lot of useful fields, methods, and mixins, listed below.

This list may look long, but don't worry. 
You already learned the important ones in the [Basics](../category/basics), 
and those are **enough to be productive**.
                                       
&nbsp;

So why the long list? App development is complex, and Async Redux aims to cover a wide range 
of real situations. Other state management tools may offer fewer features, but then you have 
to solve those problems on your own, which is difficult. 
Async Redux, instead, asks how it can help you, and offers solutions that work great 
because they are tightly integrated with the tool itself.

### Most important ones are:

* [`state`](../basics/state) - Returns current state in the store. This is a getter, and can change after every await,
  for async actions.
* [`reduce`](../basics/actions-and-reducers) - The action reducer that returns the new state. Must be overridden.
* [`dispatch`](../basics/dispatching-actions#1-dispatch) - Dispatches an action (sync or async).
* [`dispatchAndWait`](../basics/dispatching-actions#2-dispatchandwait) - Dispatches an action and returns a `Future`
  that resolves when it finishes.
* [`isWaiting`](../basics/wait-fail-succeed#show-a-spinner) - Checks if one or more async actions are currently being
  processed.
* [`isFailed`](../basics/wait-fail-succeed#show-an-error-message) - Returns true if an action failed with a
  `UserException`.

### Useful ones are:

* [`store`](../basics/store) - Returns the store instance.
* [`before`](./before-and-after-the-reducer) - Overridable method that runs before `reduce` during action dispatching.
* [`after`](./before-and-after-the-reducer) - Overridable method that runs after `reduce` during action dispatching.
* [`wrapError`](./errors-thrown-by-actions) - Overridable method that catches or modifies errors thrown by `reduce` or
  `before` methods.
* [`dispatchAndWaitAll`](../basics/dispatching-actions#4-dispatchandwaitall) - Dispatches multiple actions in parallel
  and waits for all to finish.
* [`dispatchAll`](../basics/dispatching-actions#3-dispatchall) - Dispatches multiple actions in parallel.
* [`dispatchSync`](../basics/dispatching-actions#5-dispatchsync) - Dispatches a sync action, throws if the action is
  async.
* [`exceptionFor`](../basics/wait-fail-succeed#show-an-error-message) - Returns the `UserException` of the action that
  failed.
* [`clearExceptionFor`](../basics/wait-fail-succeed#combining-iswaiting-and-isfailed) - Removes the given action type
  from the failed actions list.
* [`waitCondition`](../miscellaneous/wait-condition) - Returns a future that completes when the given state condition is
  true.
* [`waitAllActions`](../miscellaneous/advanced-waiting) - Returns a future that completes when all given actions finish.
* [`status`](./action-status) - Returns the current status of the action (waiting, failed, completed, etc.).
* [`prop`](../miscellaneous/streams-and-timers) - Gets a property from the store (timers, streams, etc.).
* [`setProp`](../miscellaneous/streams-and-timers) - Sets a property in the store.
* [`disposeProp`](../miscellaneous/streams-and-timers) - Disposes a single property by its key.
* [`disposeProps`](../miscellaneous/streams-and-timers) - Disposes all or selected properties (timers, streams,
  futures).
* [`env`](../miscellaneous/dependency-injection) - Gets the store environment, useful for global values scoped to the
  store.
* [`microtask`](../basics/async-actions#one-important-rule) - Returns a future that completes in the next microtask.
* [`assertUncompletedFuture`](../basics/async-actions#one-important-rule) - Asserts that an async reducer has at least
  one await.
* `initialState` - Action getter that hols the state as it was when the action was dispatched. This does NOT change.

### Useful mixins:

* [`CheckInternet`](internet-mixins#checkinternet) - Checks if there is internet before running the action, shows dialog if not.
* [`NoDialog`](internet-mixins#nodialog) - Used with `CheckInternet` to turn off the dialog when there is no internet.
* [`AbortWhenNoInternet`](internet-mixins#abortwhennointernet) - Silently aborts the action if there is no internet.
* [`UnlimitedRetryCheckInternet`](internet-mixins#unlimitedretrycheckinternet) - Retries indefinitely with internet checking, prevents reentrant dispatches.
* [`NonReentrant`](control-mixins#nonreentrant) - Prevents the action from being dispatched if it's already running.
* [`Retry`](control-mixins#retry) - Retries the action if it fails, with configurable delays and max retries.
* [`UnlimitedRetries`](control-mixins#retry) - Used with `Retry` to retry indefinitely.
* [`Debounce`](control-mixins#debounce) - Delays action execution until after a period of inactivity.
* [`Throttle`](control-mixins#throttle) - Ensures the action is dispatched at most once per throttle period.
* [`OptimisticCommand`](optimistic-mixins#optimisticcommand) - Applies state changes optimistically, rolls back on error.
* [`OptimisticSync`](optimistic-mixins#optimisticsync) - Optimistic updates with coalescing; merges rapid dispatches into one sync.
* [`OptimisticSyncWithPush`](optimistic-mixins#optimisticsyncwithpush-and-serverpush) - Like `OptimisticSync` but with revision tracking for server pushes.
* [`ServerPush`](optimistic-mixins#optimisticsyncwithpush-and-serverpush) - Handles server-pushed updates for `OptimisticSyncWithPush`.

### Finally, these are one-offs for special cases:

* [`stateTimestamp`](../basics/state) - Returns the timestamp of the last state change.
* [`wrapReduce`](./wrapping-the-reducer) - Wraps the `reduce` method for pre- / post-processing.
* [`abortDispatch`](./aborting-the-dispatch) - Returns true to abort the action dispatch before it runs.
* [`isSync`](../basics/sync-actions) - Returns true if the action is sync, false if async.
* [`ifWrapReduceOverridden_Sync`](./wrapping-the-reducer) - Returns true if `wrapReduce` is overridden synchronously.
* [`ifWrapReduceOverridden_Async`](./wrapping-the-reducer) - Returns true if `wrapReduce` is overridden asynchronously.
* [`ifWrapReduceOverridden`](./wrapping-the-reducer) - Returns true if `wrapReduce` is overridden (sync or async).
* `runtimeTypeString` - Returns the `runtimeType` without the generic part.
