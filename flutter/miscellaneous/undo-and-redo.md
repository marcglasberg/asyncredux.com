---
sidebar_position: 19
---

# Undo and Redo

AsyncRedux makes it easy to add undo and redo features to your app.
The approach is straightforward:

1. Create a state observer to save states to a history list
2. Create actions to navigate through that history (undo/redo)

This also works to undo/redo only **part** of the state. Your observer can save only that part,
and your actions can revert only that part.

## Example Implementation

### 1. Create the UndoRedoObserver

The observer saves each state change to a history list:

```dart
class UndoRedoObserver implements StateObserver<AppState> {
  final List<AppState> _history = [];
  int _currentIndex = -1;
  
  // Maximum number of states to keep in history
  final int maxHistorySize;
  
  UndoRedoObserver({this.maxHistorySize = 50});  
  
  void observe(
    ReduxAction<AppState> action,
    AppState prevState,
    AppState newState,
    Object? error,
    int dispatchCount,
  ) {
    // Don't save states from undo/redo actions themselves
    if (action is UndoAction || action is RedoAction) return;
    
    // If state didn't change, don't add to history
    if (identical(prevState, newState)) return;
    
    // Remove any "future" states if we're not at the end
    if (_currentIndex < _history.length - 1) {
      _history.removeRange(_currentIndex + 1, _history.length);
    }

    // Add the new state
    _history.add(newState);
    _currentIndex = _history.length - 1;
    
    // Limit history size
    if (_history.length > maxHistorySize) {
      _history.removeAt(0);
      _currentIndex--;
    }
  }

  bool get canUndo => _currentIndex > 0;
  
  bool get canRedo => _currentIndex < _history.length - 1;
  
  AppState? getPreviousState() {
    if (!canUndo) return null;
    _currentIndex--;
    return _history[_currentIndex];
  }

  AppState? getNextState() {
    if (!canRedo) return null;
    _currentIndex++;
    return _history[_currentIndex];
  }
}
```

### 2. Register the Observer with the Store

```dart
final undoRedoObserver = UndoRedoObserver();

var store = Store<AppState>(
  initialState: AppState.initialState(),
  stateObservers: [undoRedoObserver],
);
```

### 3. Create Undo and Redo Actions

```dart
class UndoAction extends ReduxAction<AppState> {  
  AppState? reduce() {
    AppState? previousState = undoRedoObserver.getPreviousState();
    return previousState ?? null;
  }
}

class RedoAction extends ReduxAction<AppState> {  
  AppState? reduce() {
    AppState? nextState = undoRedoObserver.getNextState();
    return nextState ?? null;
  }
}
```

### 4. Use in Your UI

```dart
class UndoRedoButtons extends StatelessWidget {  
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          icon: Icon(Icons.undo),
          onPressed: () => context.dispatch(UndoAction()),                
        ),
        IconButton(
          icon: Icon(Icons.redo),
          onPressed: () => context.dispatch(RedoAction()),
        ),
      ],
    );
  }
}
```
