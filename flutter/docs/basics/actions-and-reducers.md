---
sidebar_position: 3
---

# Actions and Reducers

As discussed, the `AppState` class that represents the state is _immutable_.

This means you can't change the store state directly.
Instead, you must create another state object with the desired changes,
and then tell the store to use that new state.

Also, the store state is private, and you can't simply change it from anywhere in your code.
To change the store state, the only way is to "dispatch" an **action**.

In AsyncRedux all actions are classes that extend `ReduxAction<AppState>`.
This class has an abstract `reduce()` method, and all actions you create must override this method.

The `reduce()` method is called the "reducer" of the action, and it runs when the action is
dispatched.
The reducer has access to the **current** store state,
and must return a new state, which then becomes the **new** store state.

This is an example of an action:

```dart
class SetNameAction extends ReduxAction<AppState> {

  final String name;
  SetNameAction(this.name);

  @override
  AppState reduce() {
    var newUser = state.user.withName(name);
    return state.withUser(newUser);
  }
}
```

## In more detail

The reducer has direct access to:

- The store `state` (which is a getter of the `ReduxAction` class).
- The action **fields**, passed to the action when it was instantiated and dispatched.
- The `dispatch` method, so that the reducer can dispatch other actions, if necessary.

<br></br>

The reducer's job is to create a new state, which will then become the new store state.

To that end, the `reduce()` method may return:

* A new state, which will be applied to the store immediately.
* A `Future` that will complete with a new state, which will be applied to the store when the
  future completes.
* Or `null`, which means the state should not change.

## Synchronous or Asynchronous

The abstract `ReduxAction.reduce()` method signature has a return type of `FutureOr<AppState?>`.

This means your action reducer, which overrides it,
must return one or the other: 

* `AppState?` or 
* `Future<AppState?>`

If it returns `AppState?` it's considered a **synchronous** action.

If it returns `Future<AppState?>` it's considered an **asynchronous** action.

Note AsyncRedux knows if an action is synchronous or asynchronous by checking
the `reduce()` method signature. If you return `FutureOr<AppState?>` it can't know if it's sync
or async, and it will throw a `StoreException`:

```
Reducer should return `St?` or `Future<St?>`. 
Do not return `FutureOr<St?>`.
```

<hr></hr>

Next, let's learn more about synchronous actions, the simpler kind of action.

