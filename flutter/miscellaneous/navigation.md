---
sidebar_position: 1
---

# Navigation

Navigation in Flutter is a complex topic, and it's not directly related to state management.
Nevertheless, Async Redux provides a way to navigate your app by dispatching actions, solely
because it then gets easier to create navigation tests.

In other words, using Async Redux's navigation capabilities is optional. 
If you don't intend to use it, you can skip this page.

For the moment, I only provide navigation capabilities for _Navigator 1_. 
If you want to use newer navigation packages you can create your own actions to implement it, 
or skip navigating with Async Redux altogether.

# Setup

Async Redux comes with a `NavigateAction` which you can dispatch to navigate your Flutter app. 

For this to work, during app initialization you must create a "navigator key" 
and then inject it into that action:

```dart
final navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  NavigateAction.setNavigatorKey(navigatorKey);
  ...
}
```

You must also use this same navigator key in your `MaterialApp`:

```dart
return StoreProvider<AppState>(
  store: store,
  child: MaterialApp(
	  ...
	  navigatorKey: navigatorKey,
	  initialRoute: '/',
	  onGenerateRoute: ...
	  ),
);
```

# How to use it

In the `NavigateAction`, most Navigator methods are available.
For example pushNamed:

```dart                 
dispatch(NavigateAction.pushNamed("myRoute"));
```

Note it's common needing to explicitly know the current route. However, the recommendation is
that you **don't ever save the current route in the store**. 
This would create all sorts of problems.

If you need to know the current route you're in, 
you may use this static method provided by `NavigateAction`:

```dart
String routeName = NavigateAction.getCurrentNavigatorRouteName(context);
```     

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_navigate.dart">
Navigate Example</a>.
