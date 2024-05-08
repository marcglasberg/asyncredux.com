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

<hr></hr>

Next, let's see how to access the store from inside of widgets.

