---
sidebar_position: 10
---

# Dependency Injection

While you can always use <a href="https://pub.dev/packages/get_it">get_it</a> or any other
dependency injection solution, AsyncRedux lets you inject your dependencies directly in the
**store**, and then access them in your actions and view-model factories.

The dependency injection idea was contributed by <a href="https://github.com/craigomac">Craig
McMahon</a>.

To inject an environment object with the dependencies:

```dart
store = Store<AppState>(
   initialState: ...,
   environment: Environment(),
);
```

You can then extend both `ReduxAction` and `VmFactory` to provide typed access to your environment:

```dart
abstract class AppFactory<T extends Widget?, Model extends Vm> extends VmFactory<int, T, Model> {
  AppFactory([T? connector]) : super(connector);

  @override
  Environment get env => super.env as Environment;
}


abstract class Action extends ReduxAction<int> {

  @override
  Environment get env => super.env as Environment;
}
```

Then, use the environment when creating the view-model:

```dart
class Factory extends AppFactory<MyHomePageConnector> {
  Factory(connector) : super(connector);

  @override
  ViewModel fromStore() => ViewModel(
        counter: env.limit(state),
        onIncrement: () => dispatch(IncrementAction(amount: 1)),
      );
}

```

And also in your actions:

```dart
class IncrementAction extends Action {
  final int amount;
  IncrementAction({required this.amount});

  @override
  int reduce() => env.incrementer(state, amount);
}
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_environment.dart">
Dependency Injection Example</a>.
