---
sidebar_position: 2
---

# Undo and Redo

It's easy to create undo/redo features in Async Redux. 

For example, here we create the store with 
a [state-observer](./log_and_metrics#stateobserver) that saves the most recent 100 states:

```dart
var store = Store<State>(
  initialState: state,  
  stateObserver: stateObserver,
);

const stateHistory = [];

function stateObserver(action, prevState, newState, error, dispatchCount) {
  stateHistory.push(newState);
  if (stateHistory.length > 100) {
    stateHistory.shift();
  }
}
```

When you want to recover one of the states, simple dispatch the built-in `UpdateStateAction`:

```dart
// Recover the 42nd state in the history
dispatch(new UpdateStateAction((state) => stateHistory[41]);
```

:::tip

This also works to undo/redo only part of the state. If you are only interested in undoing part
of the state, your observer can save only that part, and your action can revert only that part.

:::

## Try it yourself
              
The app below shows three counters, and three `+` buttons to change them.
Press the `Undo` and `Redo` buttons to undo and redo changes.
The current and past states are shown in the `History` section.
Undone states are shown in grey.

<iframe
src="https://codesandbox.io/embed/njfpht?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=65&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '500px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>
