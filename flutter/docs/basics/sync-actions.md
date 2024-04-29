---
sidebar_position: 4
---

# Sync Actions

If you want to modify the state synchronously, 
simply declare the reducer to return `AppState?` and 
return a new state.

For example, let's start with a simple action to increment a counter by some value:

```dart
class IncrementAction extends ReduxAction<AppState> {
  final int amount;
  IncrementAction({this.amount});
  
  AppState? reduce() {
    return state.copy(counter: state.counter + amount));
  }
}
```

Note the `reduce()` method above has direct access to both the counter state (`state.counter`)
and to the action state (the field `amount`).

This action can be dispatched elsewhere like this:

```dart
store.dispatch(IncrementAction(amount: 3));
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main.dart">
Increment Example</a>.

<hr></hr>

Next, let's learn more about asynchronous actions, which are necessary when you need to do
something that takes time, like reading from a database or making a network request.
