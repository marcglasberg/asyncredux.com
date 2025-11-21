---
sidebar_position: 6
---

# Async actions

Your action is asynchronous if the return type of its `reduce()` method is `Future<AppState?>`.

It's only necessary to make your action async if you need to do some asynchronous work
inside the `reduce()` method, such as accessing a database, calling a web service, reading
a file, etc.

> Note: In other Redux versions you can only do async work by using the so-called "middleware",
> which is complex. In Async Redux you can simply return a `Future` and it works.

&nbsp;

As an example, suppose you want to increment a counter by a value you get from the database.
The database access is async, so you must use an async reducer:

```dart
class GetAmountAndIncrement extends ReduxAction<AppState> {
  
  Future<AppState?> reduce() async {
    int value = await getAmount();
    return state.copy(counter: state.counter + value));
  }
}
```

This async action can be dispatched just like a sync action:

```dart
store.dispatch(GetAmountAndIncrement());
```

> Note: While the `reduce()` method of a *sync* reducer runs synchronously with the dispatch,
> the `reduce()` method of an *async* reducer will be called synchronously, but will always return
> the state in a later microtask.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_increment_async.dart">
Increment Async Example</a>.

## Convert to Async in the IDE

* **IntelliJ or Android Studio**
  On Windows or Linux, place the cursor inside the `reduce()` method and press `Alt + Enter`,
  then choose Convert to async function body. On macOS use `Option + Enter`.

* **VS Code**
  On Windows and Mac, place the cursor inside the method body and open the code action menu
  with `Ctrl + .` or by clicking the lightbulb. Choose Convert to async function body.
  This converts the body and adds `async`, but it may not change the return type automatically.
  If the analyzer suggests a fix, apply it to change `AppState? reduce()` to `Future<AppState?> reduce()`.

## One important rule

When your reducer is async (i.e., returns `Future<AppState?>`) you must make sure you **do not
return a completed future**, meaning all execution paths of the reducer must pass through at least
one `await` keyword.

In other words, **don't return a Future if you don't need it**.

If you don't follow this rule, Async Redux may seem to work ok, but will eventually misbehave.

If your reducer has no `await`s, you must return `AppState?` instead of `Future<AppState?>`,
or simply add `await microtask;` to the start of your reducer, or return `null`.
For example, these are right:

```dart
// Works
AppState? reduce() {
  return state;
}

// Works
AppState? reduce() {
  someFunc();
  return state;
}

// Works
Future<AppState?> reduce() async {
  await someFuture();
  return state;
}

// Works
Future<AppState?> reduce() async {
  await microtask;
  return state;
}

// Works
Future<AppState?> reduce() async {
  if (state.someBool) return await calculation();
  return null;
}
```

But these are wrong:

```dart
// Fails
Future<AppState?> reduce() async {
  return state;
}

// Fails
Future<AppState?> reduce() async {
  someFunc();
  return state;
}

// Fails
Future<AppState?> reduce() async {
  if (state.someBool) return await calculation();
  return state;
}
```

It's generally easy to make sure you are not returning a _completed future_.

In the rare case your reducer function is very complex, and you are unsure that all code paths
pass through an `await`, just add `assertUncompletedFuture();` at the very END of your `reduce`
method, right before the `return`.

If you do that, an error will be shown in the console if
the `reduce` method ever returns a completed future.

<hr></hr>

Next, let's see how and why you can have actions that don't modify the state.
