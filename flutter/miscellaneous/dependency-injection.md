---
sidebar_position: 11
---

# Dependency Injection

While you can always use <a href="https://pub.dev/packages/get_it">get_it</a> or any other
dependency injection solution, AsyncRedux lets you inject your dependencies directly in the
**store**, and then access them in your actions, widgets, and view-model factories.

One advantage of this approach is that the dependencies are scoped to the store, 
so they are disposed automatically when the store is disposed. 
This is especially useful in tests, where you create a new store for each test 
and do not need to dispose the dependencies manually.

## Setup

First, define an `Environment` class that holds your dependencies:

```dart
class Environment {
  ...
}
```

Then, when creating your store, pass it an instance of the environment:

```dart
store = Store<AppState>(
   initialState: ...,
   environment: Environment(),
);
```

You can then extend `ReduxAction`, `BuildContext`, and `VmFactory` (if you use a `StoreConnector`)
to provide typed access to your environment:

```dart
// Action base class
abstract class AppAction extends ReduxAction<AppState> {
  Environment get env => super.env as Environment;
}

// BuildContext extension
extension BuildContextExtension on BuildContext {
  R? event<R>(Evt<R> Function(AppState state) selector) => getEvent<AppState, R>(selector);
}

// View-model factory base class
abstract class AppFactory<T extends Widget?, Model extends Vm> extends VmFactory<AppState, T, Model> {
  AppFactory([T? connector]) : super(connector);
  Environment get env => super.env as Environment;
}
```

## Usage

Use the environment when creating your actions:

```dart
class Increment extends AppAction {
  final int amount;
  Increment({required this.amount});  
  AppState reduce() => env.incrementer(state, amount); // Here!
}
```

Use it in your widgets:

```dart
Widget build(BuildContext context) {
  final limit = context.event((st) => env.limiter(st)); // Here!
  return Text('Limit is $limit');
}
```

And also in your view-model (if you use a `StoreConnector`):

```dart
class Factory extends AppFactory<MyHomePageConnector> {
  Factory(connector) : super(connector);

  ViewModel fromStore() => ViewModel(
    counter: env.limit(state), // Here!
    onIncrement: () => dispatch(Increment(amount: 1)),
  );
}
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_environment.dart">
Dependency Injection Example</a>.

> _The dependency injection idea was contributed by <a href="https://github.com/craigomac">Craig McMahon</a>._
