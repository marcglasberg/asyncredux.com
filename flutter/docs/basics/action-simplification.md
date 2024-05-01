---
sidebar_position: 7
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
class IncrementAction extends ReduxAction<AppState> {
  
  AppState? reduce() { 
    ... 
  }  
}
```

You can write:

```dart
class IncrementAction extends AppAction {
  
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

I personally like to suffix my actions with `Action`, so I can easily identify them in my code.
However, that's just my convention, and you can name your actions as you prefer. For example,
you could name them `Increment`, `GetAmount` etc.:

```dart
class Increment extends AppAction {
  
  AppState? reduce() {  
    ... 
  }  
}
```

And later:

```dart
dispatch(Increment());
```

<hr></hr>

Next, let's see how to dispatch actions.
