---
sidebar_position: 6
---

# Async actions

Your action is asynchronous if the return type of its `reduce()` method is `Future<AppState?>`.

It's only necessary to make your action async if you need to do some asynchronous work
inside the `reduce()` method, such as calling web services or reading files.

As an example, suppose you want to increment a counter by a value you get from a database.
The database access is async, so you must use an async reducer:

```dart
class GetAmountAndIncrement extends ReduxAction<AppState> {
  
  Future<AppState?> reduce() async {
    int value = await getAmount();
    return state.copy(counter: state.counter + value);
  }
}
```

Async actions are dispatched just like sync actions, there is no difference:

```dart
store.dispatch(GetAmountAndIncrement());
```

> Note: While the `reduce()` method of a *sync* reducer runs synchronously with the dispatch,
> the `reduce()` method of an *async* reducer will be called synchronously, but will always 
> return and change the state in a later microtask.

---

## One important rule

An async `reduce()` must run at least one `await` in the reducer itself before returning
a non-null value. Returning `null` is safe without an `await` because it leaves the state
unchanged.

**We strongly recommend enabling `async_redux_lints` as it checks these return paths for 
you during analysis.**
[Set up the analyzer plugin](https://pub.dev/packages/async_redux_lints#install) ·
[See the lint rule](https://pub.dev/packages/async_redux_lints#reduce_without_await)

If the lint reports an error, make the reducer synchronous when it has no async work (make it return `AppState?`).
If it needs to stay async, await the work on the affected path or add
`await microtask;` at the start of the reducer.

These reducers follow the rule:

```dart
// Works
AppState? reduce() => state;

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

The lint reports an error in each of these reducers:

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

<hr></hr>

Next, let's see how and why you can have actions that don't modify the state.
