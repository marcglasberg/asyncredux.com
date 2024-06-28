---
sidebar_position: 3
---

# Aborting the dispatch

You may override the action's `abortDispatch()` function to completely prevent 
running the action if some condition is true.

In more detail, if function `abortDispatch()` returns `true`, 
the action will not be dispatched: `before`, `reduce` and `after` will not be called. 

This is an advanced feature only useful under rare
circumstances, and you should only use it if you know what you are doing.

# Example

```dart
class UpdateUserInfo extends Action {

  // If there is no user, the action will not run.
  abortDispatch() {
    return state.user === null;
  }

...
```
