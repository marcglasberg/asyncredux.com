---
sidebar_position: 6
---

# Before and After the Reducer

Sometimes, while an async reducer is running, you want to prevent the user from touching the screen.
Also, sometimes you want to check preconditions like the presence of an internet connection, and
don't run the reducer if those preconditions are not met.

To help you with these use cases, you may override methods `ReduxAction.before()`
and `ReduxAction.after()`, which run respectively before and after the reducer.

The `before()` method runs before the reducer. If you want it to run synchronously, it should
return `void`:

```dart
void before() { ... }
```

To run it asynchronously, return `Future<void>`:

```dart
Future<void> before() async { ... }
```

If it throws an error, then `reduce()` will NOT run. This means you can use it to check any
preconditions and throw an error if you want to prevent the reducer from running. For example:

```dart
Future<void> before() async => await checkInternetConnection();
```

This method is also capable of dispatching actions, so it can be used to turn on a modal barrier:

```dart
void before() => dispatch(BarrierAction(true));
```

Note: If this method runs asynchronously, then `reduce()` will also be async, since it must wait for
this one to finish.

The `after()` method runs after `reduce()`, even if an error was thrown by `before()` or `reduce()`
(akin to a "finally" block).

Avoid `after()` methods which can throw errors. If the `after()` method throws an error, then this
error will be thrown *asynchronously* (after the "asynchronous gap")
so that it doesn't interfere with the action. Also, this error will be missing the original
stacktrace.

The `after()` method can also dispatch actions, so it can be used to turn off some modal barrier
when the reducer ends, even if there was some error in the process:

```dart
void after() => dispatch(BarrierAction(false));
```

Complete example:

```dart
// This action increments a counter by 1, and then gets some description text.
class IncrementAndGetDescriptionAction extends ReduxAction<AppState> {

  @override
  Future<AppState> reduce() async {
	dispatch(IncrementAction());
	String description = await read(Uri.http("numbersapi.com","${state.counter}");
	return state.copy(description: description);
  }

  void before() => dispatch(BarrierAction(true));

  void after() => dispatch(BarrierAction(false));
}
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_before_and_after.dart">
Before and After Example</a>.
