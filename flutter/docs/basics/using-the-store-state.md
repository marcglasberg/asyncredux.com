---
sidebar_position: 3
---

# Using the store state 

To access the store state inside of widgets, you could use the
provided `getState` extension on `context`:

```dart
Widget build(context) {
  return Text('User name is ' + context.getState<AppState>().user.name);
}
```

But to make it even easier,
you'd usually define a typed `state` extension by copying the following to your own code:

```dart
extension BuildContextExtension on BuildContext {
  AppState get state => getState<AppState>();
}
```

This allows you to write simply `context.state`:

```dart
Widget build(context) {
  return Text('User name is ' + context.state.user.name);
}
```

All widgets that use the store state like this
will automatically rebuild whenever the store state changes.

<hr></hr>

Next, let's see how to define actions and reducers, that allows us to change the store state.
