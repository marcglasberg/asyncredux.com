---
sidebar_position: 2
---

# Aborting the dispatch

You may override the action's `abortDispatch()` method to completely prevent
running the action if some condition is true.

In more detail, if this method returns `true`, then `before()`, `reduce()`
and `after()` will not be called, and the state won't change.

This is only useful under rare circumstances, and you should only use it if you know what you are
doing.

# Example

```dart
bool abortDispatch() => state.user == null;
```
