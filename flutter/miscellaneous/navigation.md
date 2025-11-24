---
sidebar_position: 1
---

# Navigation

Navigation in Flutter is a complex topic, and it's not directly related to state management.
However, Async Redux lets you navigate your app by dispatching actions, 
mainly because this makes it easy to write unit tests to test navigation.

Using Async Redux for navigation is completely optional.
If you prefer to handle navigation in another way, you can skip this page.

At the moment, navigation support is only available for *Navigator 1*.
If you use a newer navigation package, you can create your own actions for it,
or simply avoid using Async Redux for navigation.

# Setup

Async Redux provides a `NavigateAction` that you can dispatch to navigate your Flutter app.

To make this work, you first need to create a "navigator key" during app initialization
and inject it into the navigation action:

```dart
final navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  NavigateAction.setNavigatorKey(navigatorKey);
  ...
}
```

You must also use this same key in your `MaterialApp`:

```dart
return StoreProvider<AppState>(
  store: store,
  child: MaterialApp(
    ...
    navigatorKey: navigatorKey, // Here!
    initialRoute: '/',
    onGenerateRoute: ...
  ),
);
```

# How to use it

The `NavigateAction` class provides most of the common `Navigator` methods.
For example, to push a named route:

```dart
dispatch(NavigateAction.pushNamed("myRoute"));
```

## Current route

Sometimes you may need to get the current route name in your app.
It's best **not** to store the current route name in the app state, 
as that can cause issues.

Instead, use this static method from `NavigateAction`:

```dart
String routeName = NavigateAction.getCurrentNavigatorRouteName(context);
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_navigate.dart">
Navigate Example</a>.
