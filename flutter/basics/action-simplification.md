---
sidebar_position: 8
---

# Action simplification

Assuming your store state is called `AppState`, 
all your actions must extend the abstract base class `ReduxAction<AppState>`.

To avoid repeating the generic type, add a custom "base action" to your code,
such as `Action` or `AppAction`, with the type `AppState` already included:

```dart
abstract class AppAction extends ReduxAction<AppState> { } 
```

Your app actions can then inherit from `ReduxAction<AppState>` through `AppAction`.

Instead of:

```dart
class Increment extends ReduxAction<AppState> {
  
  AppState? reduce() { 
    ... 
  }  
}
```

You can write:

```dart
class Increment extends AppAction {
  
  AppState? reduce() { 
    ... 
  }  
}
```

> As we will see later, creating your own `AppAction` class is also useful because you can add extra features to it, 
> and they will be available to all your actions.

## Important

From now on, all code examples extend `AppAction` when defining actions for your app.
AsyncRedux APIs such as `Store.dispatch` use `ReduxAction<AppState>` so they can accept 
both your app actions and actions supplied by AsyncRedux, such as `NavigateAction`.

## Naming conventions

Some people like to add the `Action` suffix at the end of their action names to make them easier to spot in the code. 
This is only a convention. You can name them as you like. For example:

```dart
// One possible name
class Increment extends AppAction { ...

// Another possible name
class IncrementAction extends AppAction { ...
```

And later:

```dart
dispatch(Increment());

// Or
dispatch(IncrementAction());
```

<hr></hr>

Next, let's see how to dispatch actions.
