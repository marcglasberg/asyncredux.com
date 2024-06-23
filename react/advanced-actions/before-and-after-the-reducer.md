---
sidebar_position: 1
---

# Before and after the reducer

Suppose you want to prevent the user from touching the screen, while `MyAction` is running.
This means adding a modal barrier before the action starts, and removing it after the action ends.

It is indeed common to have some side effects before and after the reducer runs.
To help you with these use cases, you may override you action methods `before()`
and `after()`, which run respectively before and after the reducer.

> Note: implementing the `reduce()` method is mandatory, but `before()` and `after()` are optional.
> Their default implementation is to do nothing.

## Before

The `before()` method runs before the reducer.

To run synchronously, return `void`. To run it asynchronously, return `Future<void>`:

```dart
// Sync
void before() { ... }

// Async
Future<void> before() async { ... }
```

What happens if method `before()` throws an error? In this case, the `reduce()` method will NOT run.
This means you can use `before()` to check any preconditions,
and maybe throw an error to prevent the reducer from running. For example:

```dart
// Shows a dialog if there is no internet connection, 
// and prevents the reducer from running.
Future<void> before() async {
  if (!await hasInternetConnection()) 
    throw UserException('No internet connection');
}
```

> Note: If method `before()` returns a future, then the action is also async
> (will complete in a later microtask), regardless of the `reduce()` method being sync or not.

## After

The `after()` method runs after the reducer.

It's important to note the `after()` method is akin to a _finally block_,
since it will always run, even if an error was thrown by `before()` or `reduce()`.
This is important so that it can undo any side effects that were done in `before()`, 
even if there was an error later in the reducer.

> Note: Make sure your `after()` method doesn't throw an error.
> If it does, the error will be thrown _asynchronously_ (after the "asynchronous gap")
> so that it doesn't interfere with the action, but still shows up in the console.

## Example

In our model barrier example described above,
we could dispatch an action to turn on a modal barrier on and off.

Suppose we define a `BarrierAction`:

```dart
class BarrierAction extends AppAction {
  final bool hasBarrier;
  BarrierAction(this.hasBarrier);
  State reduce() => state.copy(hasBarrier: hasBarrier);
}
```

And then your widget tree contains a modal barrier, 
which is shown only when `hasBarrier` is true:

```dart
return context.state.hasBarrier 
  ? ModalBarrier() 
  : Container();
```

After this is set up, you may use `before()` and `after()` to dispatch the `BarrierAction`:

```dart
class MyAction extends AppAction {
  
  Future<State> reduce() async {	
	String description = await read(Uri.http("numbersapi.com","${state.counter}");
	return state.copy(description: description);
  }

  void before() => dispatch(BarrierAction(true));
  void after() => dispatch(BarrierAction(false));
}
```

The above `BarrierAction` is demonstrated
in <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_event_redux.dart">
this example</a>.
           
### Creating a Mixin

You may also create a mixin to make it easier to add this behavior to multiple actions:

```dart
mixin Barrier on AppAction {
  void before() => dispatch(BarrierAction(true));
  void after() => dispatch(BarrierAction(false));
}
```

Which allows you to write `with Barrier`:

```dart
class MyAction extends AppAction with Barrier {

  Future<State> reduce() async {	
    String description = await read(Uri.http("numbersapi.com","${state.counter}");
    return state.copy(description: description);
  }
}
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_before_and_after.dart">
Before and After Example</a>.
