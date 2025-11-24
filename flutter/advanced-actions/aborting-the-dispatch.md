---
sidebar_position: 7
---

# Aborting the dispatch

You can override the `abortDispatch()` method to stop the action from running 
when a condition is true.

:::warning
This is a power feature that you may not need to learn.
If you do, use it with caution.
:::

If this method returns `true`, then methods `before()`, `reduce()`, and `after()` 
will not run, and the state will stay the same.

This is useful only in rare cases. 
Use it only if you are sure it is the right solution.

## Example

```dart
bool abortDispatch() => state.user == null;
```
