---
sidebar_position: 8
---

# Aborting the dispatch

You may override the action's `abortDispatch` to completely prevent the action to run if some
condition is true; In more detail, if this method returns `true`, methods `before`, `reduce`
and `after` will not be called, and the action will not be visible to the `StoreTester`. This is
only useful under rare circumstances, and you should only use it if you know what you are doing. For
example:

```dart
@override
bool abortDispatch() => state.user.name == null;
```
