---
sidebar_position: 2
---

# Store

Declare your store by instantiating the `Store` class and using `AppState` as the type parameter:

```dart
var store = Store<AppState>( ... );
```  

However, you must provide an initial state, which, simply for encapsulation purposes is usually
created by calling a static method `initialState` on your `AppState` class:

```dart
var store = Store<AppState>(
  initialState: AppState.initialState(),
);
```  

Then, to use the store, add it in a `StoreProvider` widget, at the top of your widget tree:

```dart
import 'package:async_redux/async_redux.dart';
...

Widget build(context) {
  return StoreProvider<AppState>(
    store: store,
    child: MaterialApp( ... ), 
  );                      
}
```

# Accessing the store state

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
