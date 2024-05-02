---
sidebar_position: 1
---

# Navigation

AsyncRedux comes with a `NavigateAction` which you can dispatch to navigate your Flutter app. For
this to work, during app initialization you must create a navigator key and then inject it into the
action:

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

Then, use the action as needed:

```dart                
// Most Navigator methods are available. 
// For example pushNamed: 
dispatch(NavigateAction.pushNamed("myRoute"));
```

Note: Don't ever save the current route in the store. This will create all sorts of problems. If you
need to know the route you're in, you may use this static method provided by `NavigateAction`:

```dart
String routeName = NavigateAction.getCurrentNavigatorRouteName(context);
```     

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_navigate.dart">
Navigate Example</a>.
