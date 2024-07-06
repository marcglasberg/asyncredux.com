---
sidebar_position: 1
---

# Log and Metrics

When you create your store, you can optionally pass it an `actionObservers` and
a `stateObserver`, which may be used for logging and collecting metrics for your app:

```tsx
const store = createStore<State>({
  initialState: State.initialState,
  actionObserver: actionObserver, // Here!
  stateObserver: stateObserver, // Here!
});
```

## actionObserver

The `actionObserver` is a function which is notified of any **action dispatching**.

Its parameters are:

- `action` is the action itself.

- `dispatchCount` is the sequential number of the dispatch.

- `ini` is the observer will actually be called twice for each action dispatch:
  One with `ini: true` when the action is dispatched (before the state is changed),
  and one with `ini: false` when the action finished dispatching (after the state is changed).

The action-observer is a good place to log which actions are dispatched by your application.
For example, the following code logs actions to the console in development and test modes,
but saves metrics in production mode:

```ts
function actionObserver(action, dispatchCount, ini) {
  if (inDevelopment() || inTests()) {
     if (ini) console.log('Action dispatched: ${action}');
     else console.log('Action finished: ${action}');
  } else {
    if (ini) saveMetrics('Dispatched: ${action}');
  }
}
```

Note the `saveMetrics` function above is a placeholder for your actual metrics saving function.

## stateObserver

The `stateObserver` is a function called for all dispatched actions,
right after the reducer returns, before the action's `after()` method,
before the action's `wrapError()`, and before the `globalWrapError()`.

Its parameters are:

- `action` is the action that changed the state.

- `prevState` is the state right before the new state returned by the reducer is applied. Note
  this may be different from the state when the action was dispatched.

- `newState` is the state returned by the reducer. Note: If you need to know if the state was
  changed or not by the reducer, you can compare both
  states: `let ifStateChanged = (prevState !== newState);`

- `error` is null if the action completed with no error. Otherwise, will be the error thrown by
  the reducer (before any wrapError is applied). Note that, in case of error, both `prevState`
  and `newState` will be the current store state when the error was thrown.

- `dispatchCount` is the sequential number of the dispatch.

The state-observer is a good place to add an interface to the Redux DevTools.
It's also a good place to logs actions and state, and collect metrics. For example:

```ts
function stateObserver(action, prevState, newState, error, dispatchCount) {
  saveMetrics(action, newState, error);
}
```

If we want to improve the saved metrics, our actions have a `log()` function that
can be used to log extra information. For example:

```ts
class LoadUser extends Action {  
  
  async reduce() {
    let user = await loadUser();
    this.log('User', user.id); // Here!
    
    return (state) => state.copy({user: user});   
  }    
}
```        

And then, the state observer can read and use the action log:

```ts
function stateObserver(action, prevState, newState, error, dispatchCount) {
  let actionLog = action.getLog(); // Here!
  saveMetrics(action, actionLog, newState, error);
}
```

## Try it yourself

<iframe
src="https://codesandbox.io/embed/3rzvsk?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=50&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '650px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>
