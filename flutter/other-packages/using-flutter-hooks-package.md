---
sidebar_position: 2
---

# flutter_hooks

How to use AsyncRedux with the `flutter_hooks` package?

Add the [flutter_hooks_async_redux](https://pub.dev/packages/flutter_hooks_async_redux) package to your app.
It provides a `useSelector` hook that subscribes a widget to a selected part of the store state.

Note: If your state is called `AppState`, you can define your own `useAppState` hook, like this:

```dart
T useAppState<T>(T Function(AppState st) converter, {bool distinct = true}) =>
   useSelector<T, AppState>(converter, distinct: distinct);
```

This will simplify the use of the hook, like this:

```dart
var username = useAppState((st) => st.username);
```
