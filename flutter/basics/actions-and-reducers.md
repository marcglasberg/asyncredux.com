---
sidebar_position: 4
---

# Actions and reducers

The class that holds the application state, typically named `AppState`, is _immutable_.

This means you cannot change the state directly. 
Instead, you create a new state object with the changes you want and tell the Redux store to use it.

The only way to do that is by **dispatching** an **action**.

In Async Redux, every action is a class that extends `ReduxAction<AppState>`,
and it includes an abstract `reduce()` method that you need to override.

The `reduce()` method is called the "reducer". 
It runs when the action is dispatched. 
It receives the **current** state and must return a **new** state, 
which will then become the new current state.

Here is an example of an action:

```dart
// Give your action a meaningful name, and extend ReduxAction<AppState>
class Increment extends ReduxAction<AppState> {  

  // Override the reduce() method 
  AppState reduce()  
    // And return a new modified state
    => state.copy(counter: state.counter + 1);    
}
```

Here is another example of an action that takes a parameter:

```dart
class SetName extends ReduxAction<AppState> {

  // Declare any fields you need to pass data to the action
  final String name;
  SetName(this.name);
  
  AppState reduce() {
    // Use the action fields and the current state to create a new state
    var newUser = state.user.withName(name);
    return state.withUser(newUser);
  }
}
```

## In more detail

The reducer has direct access to:

- The store `state` (which is a getter of the `ReduxAction` class).
- The action **fields**, passed to the action when it was dispatched.
- Other `ReduxAction` methods, that will be covered later.

<br></br>

The reducer's job is to create a new state, which will then become the new store state.
To that end, the `reduce()` method may return:

* A new state, which will be applied to the store immediately.
* A `Future` that will complete with a new state, which will be applied to the store when the
  future completes.
* Or `null`, which means the state should not change.

## Synchronous or Asynchronous

The abstract `ReduxAction.reduce()` method that you will override has a return type of `FutureOr<AppState?>`.

This means your `reduce()` methods must return one of the following:

* `AppState?` if you want the action to be **synchronous**.
* `Future<AppState?>` if you want the action to be **asynchronous**.

In other words, 
Async Redux determines whether an action is sync or async by checking what your `reduce()` method returns.

In other words, Async Redux knows if an action is synchronous or asynchronous by checking
the return value of your `reduce()` methods. 

Important: Do not return `FutureOr<AppState?>` directly. 
If you do, Async Redux cannot know if the action is sync or async, and will throw a `StoreException`:

```
Reducer should return `St?` or `Future<St?>`. 
Do not return `FutureOr<St?>`.
```

<hr></hr>

Next, let's learn more about synchronous actions, the simpler kind of action.

