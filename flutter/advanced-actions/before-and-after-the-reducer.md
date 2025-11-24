---
sidebar_position: 2
---

# Before and after the reducer
   
The `ReduxAction` class comes with the optional methods `before()` and `after()`.

## Overview

Suppose you want to stop the user from touching the screen while an action `MyAction` is running.
You can do this by adding a modal barrier before the action starts and removing it after it ends.

It is common to have side effects before and after the reducer runs.
To help with that, you can override methods `before()` and `after()`, 
which run before and after the reducer (method `reduce()`).

> Note: The `reduce()` method is required, but `before()` and `after()` are optional.
> By default, they do nothing.

## Before

The `before()` method runs before the reducer.

To run it synchronously, return `void`.
To run it asynchronously, return `Future<void>`:

```dart
// Sync
void before() { ... }

// Async
Future<void> before() async { ... }
```

If `before()` throws an error, then `reduce()` will not run.
This lets you use `before()` to check for preconditions 
and throw an error when needed to prevent the reducer from running. For example:

```dart
// Shows a dialog if there is no internet connection, 
// and prevents the reducer from running.
Future<void> before() async {
  if (!await hasInternetConnection()) 
    throw UserException('No internet connection');
}
```

> Note: If `before()` returns a future, then the action is async
> (it completes in a later microtask), even if `reduce()` is sync.

## After

The `after()` method runs after the reducer.

It works like a _finally block_, because it always runs, 
even if `before()` or `reduce()` throws an error.
This makes it safe to undo anything done in `before()`, even when something goes wrong later.

> Note: Make sure `after()` itself does not throw an error.
> If it does, the error will be thrown asynchronously, so it does not interfere with the action, 
> but it will still appear in the console.

## Example

In the modal barrier example, we can dispatch an action that turns the barrier on and off.

First define `BarrierAction`:

```dart
class BarrierAction extends AppAction {
  final bool hasBarrier;
  BarrierAction(this.hasBarrier);
  AppState reduce() => state.copy(hasBarrier: hasBarrier);
}
```

Then your widget tree shows the modal barrier only when `hasBarrier` is true:

```dart
return context.state.hasBarrier 
  ? ModalBarrier() 
  : Container();
```

Now, use `before()` and `after()` to dispatch `BarrierAction`:

```dart
class MyAction extends AppAction {
  
  Future<AppState> reduce() async {	
	String description = await read(Uri.http("numbersapi.com","${state.counter}");
	return state.copy(description: description);
  }

  void before() => dispatch(BarrierAction(true));
  void after() => dispatch(BarrierAction(false));
}
```

You can see `BarrierAction` used in 
[this example](https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_event.dart)
           
### Creating a Mixin

To reuse this behavior in many actions, create a mixin:

```dart
mixin Barrier on AppAction {
  void before() => dispatch(BarrierAction(true));
  void after() => dispatch(BarrierAction(false));
}
```

Then write `with Barrier`:

```dart
class MyAction extends AppAction with Barrier {

  Future<AppState> reduce() async {	
    String description = await read(Uri.http("numbersapi.com","${state.counter}");
    return state.copy(description: description);
  }
}
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_before_and_after.dart">
Before and After Example</a>.
