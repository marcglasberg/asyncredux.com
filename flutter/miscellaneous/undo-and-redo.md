---
sidebar_position: 18
---

# Undo and Redo

It's easy to create undo/redo features in Async Redux. When you create the store, add a
state-observer called `UndoRedoObserver`:

```dart
var store = Store<AppState>(
  initialState: state,  
  stateObservers: [UndoRedoObserver()],
);
```

That observer should add all the states it gets to a list. When you want to recover one of the
states, simple call an action called `RecoverStateAction`, like so:

```dart
class RecoverState extends ReduxAction<AppState> {
   final AppState recoveredState;

   RecoverState(this.recoveredState);

   AppState reduce() => recoveredState;
}
```

Note: This also works to undo/redo only part of the state. If you are only interested in undoing
part of the state, your observer can save only that part, and your action can revert only that part.
