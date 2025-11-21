---
sidebar_position: 8
---

# Action simplification

All your actions must extend the abstract base class `ReduxAction<AppState>`.

To avoid repeating the generic type, add a custom "base action" to your code,
such as `Action` or `AppAction`, with the type `AppState` already included:

```dart
abstract class AppAction extends ReduxAction<AppState> { } 
```

Then, all your actions can extend this `AppAction` class, instead of `ReduxAction<AppState>`.

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

From now on, this documentation will extend `AppAction` instead of `ReduxAction<AppState>`, 
assuming you created the `AppAction` class in your code.

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
