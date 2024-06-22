---
sidebar_position: 3
---

# Aborting the dispatch

You may override the action's `abortDispatch()` method to completely prevent the action to run if
some condition is true.

In more detail, if this method returns `true`, methods `before()`, `reduce()`
and `after()` will not be called and the state won't change.

This is only useful under rare circumstances, and you should only use it if you know what you are
doing.

# Example

```dart
@override
bool abortDispatch() => state.user == null;
```
