---
sidebar_position: 2
---

# Store

Declare your store by creating an instance of the `Store` class, with `AppState` as the state type:

```dart
var store = Store<AppState>( ... );
```  

You must also provide an initial state.
For better encapsulation, this is usually done with a static `initialState` method on your `AppState` class:

```dart
var store = Store<AppState>(
  initialState: AppState.initialState(),
);
```  

Then, to use the store, wrap your whole widget tree with a `StoreProvider`:

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

