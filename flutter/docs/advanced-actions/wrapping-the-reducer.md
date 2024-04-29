---
sidebar_position: 7
---

# Wrapping the Reducer

You may wrap the reducer to allow for some pre or post-processing. For example, suppose you want to
abort the reducer if the state changed since while the reducer was running:

```dart
Reducer<St> wrapReduce(Reducer<St> reduce) => () async {
   var oldState = state; // Remember: `state` is a getter for the current state.
   AppState? newState = await reduce(); // This may take some time, and meanwhile the state may change. 
   return identical(oldState, state) ? newState : null;
};
```

