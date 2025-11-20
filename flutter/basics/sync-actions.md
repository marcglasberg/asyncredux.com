---
sidebar_position: 5
---

# Sync actions

Your action is synchronous if the return type of its `reduce()` method is `AppState?`.

This means that the action will complete as soon as the `reduce()` method returns, 
and the state will be updated immediately.
For example, here's a simple synchronous action that increments a counter by a given amount:

```dart
class Increment extends ReduxAction<AppState> {
  final int amount;
  Increment({this.amount});
  
  AppState? reduce() 
    => state.copy(counter: state.counter + amount));  
}
```

Note the reducer above has access to both the current state (`state.counter`) 
and to the action field (`amount`) that was passed when the action was dispatched.

```dart
// Current state
print(store.state.counter); // 2

// Dispatch a synchronous action
store.dispatch(Increment(amount: 3));

// The state was updated 
print(store.state.counter); // 5
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main.dart">
Increment Example</a>.

<hr></hr>

Next, let's learn more about asynchronous actions, which are necessary when you need to do
something that takes time, like reading from a database or making a network request.
