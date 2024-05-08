---
sidebar_position: 2
---

# flutter_hooks

How to use Async Redux with the flutter_hooks package?

For those who want to use `flutter_hooks` with Async Redux, add
the https://pub.dev/packages/flutter_hooks_async_redux package to your app.
This is a very lightweight package that provides a `useSelector` hook, which is similar to the
`StoreConnector` widget, but it's a hook.

Note: If your state is called `AppState`, you can define your own `useAppState` hook, like this:

```dart
T useAppState<T>(T Function(AppState state) converter, {bool distinct = true}) =>
   useSelector<T, AppState>(converter, distinct: distinct);
```

This will simplify the use of the hook, like this:

```dart
String username = useAppState((state) => state.username);
```
