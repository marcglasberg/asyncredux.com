---
sidebar_position: 8
---

# Action simplification

As discussed, all your actions are classes that extend the abstract base
class `ReduxAction<AppState>`.

If you want to simplify your actions, you can create another "base action" in your own code,
called simply `Action` or `AppAction` that already contains the generic type `AppState`:

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

> Note: Creating your own base `AppAction` class is also nice because we can then add some extra
> functionality to it, which as a result becomes available to all your actions, as we will see later
> on.

## Important

From now on in this documentation, I will extend `AppAction` instead of `ReduxAction<AppState>`,
assuming you have created this `AppAction` class in your code.

## Naming conventions

Some people like to suffix their actions with `Action`, as to easily identify them in the code.
However, that's just a convention, and you can name your actions as you prefer. For example:

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
