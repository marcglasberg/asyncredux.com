---
sidebar_position: 11
---

# Dependency Injection

While you can always use <a href="https://pub.dev/packages/get_it">get_it</a> or any other
dependency injection solution, AsyncRedux lets you inject your dependencies directly in the
**store**, and then access them in your actions and widgets.

One advantage of this approach is that the dependencies are scoped to the store,
so they live and die with the store.
This is especially useful in tests, as [explained below](#why-inject-into-the-store).

The store constructor accepts three separate parameters for this:

* **`environment`** — Specifies if the app is running in production, staging, development,
  testing, etc.
* **`dependencies`** — A container for the injected services, repositories, APIs, etc.
* **`configuration`** — Feature flags and other configuration values.

All three are meant to be immutable, and not to change during the app execution.

## Environment

The environment is usually an enum:

```dart
enum Environment {
  production, staging, testing;

  bool get isProduction => this == Environment.production;
  bool get isStaging => this == Environment.staging;
  bool get isTesting => this == Environment.testing;
}
```

Pass it to the store:

```dart
store = Store<AppState>(
  initialState: AppState.initial(),
  environment: Environment.production, // Here!
);
```

## Dependencies

The dependencies are created by a **factory function that gets the store**,
so that they can vary according to the environment and the configuration:

```dart
abstract class Dependencies {

  factory Dependencies(Store store) {
    if (store.environment == Environment.production) {
      return DependenciesProduction();
    } else if (store.environment == Environment.staging) {
      return DependenciesStaging();
    } else {
      return DependenciesTesting();
    }
  }

  Future<User> loadUser(int id);
}
```

Pass the factory to the store:

```dart
store = Store<AppState>(
  initialState: AppState.initial(),
  environment: Environment.production,
  dependencies: (store) => Dependencies(store), // Here!
);
```

## Configuration

Use the configuration for feature flags and other configuration values:

```dart
class Config {
  bool isABtestingOn = false;
  bool showAdminConsole = false;
}
```

Just like the dependencies, the configuration is created by a factory function that gets the
store:

```dart
store = Store<AppState>(
  initialState: AppState.initial(),
  environment: Environment.production,
  dependencies: (store) => Dependencies(store),
  configuration: (store) => Config(), // Here!
);
```

Note the configuration is created **before** the dependencies,
so that the dependencies factory may read `store.configuration`.

## Accessing them in actions

`store.environment`, `store.dependencies` and `store.configuration` are all typed `Object?`.
For typed access, declare the getters below in your base action class,
and then extend that class in all your actions:

```dart
abstract class AppAction extends ReduxAction<AppState> {
  Environment get environment => store.environment as Environment;
  Dependencies get dependencies => store.dependencies as Dependencies;
  Config get config => store.configuration as Config;
}
```

You can then use them in your reducers:

```dart
class LoadUser extends AppAction {
  final int id;
  LoadUser(this.id);

  Future<AppState?> reduce() async {
    if (config.isABtestingOn) ...
    var user = await dependencies.loadUser(id); // Here!
    return state.copy(user: user);
  }
}
```

## Accessing them in widgets

Widgets should usually not be aware of the dependencies, but they may need the environment and
the configuration, for example to show a debug banner, or to hide a feature behind a flag.
Add the getters below to
your [BuildContext extension](../basics/using-the-store-state):

```dart
extension BuildContextExtension on BuildContext {
  Environment get environment => getEnvironment<AppState>() as Environment;
  Config get config => getConfiguration<AppState>() as Config;
}
```

You can then use them in your widgets:

```dart
Widget build(BuildContext context) {
  if (context.config.showAdminConsole) return AdminConsole(); // Here!
  ...
}
```

Note that accessing the environment or the configuration never rebuilds the widget,
as they are not supposed to change.

## Why inject into the store?

The main reason is **testing**.

When you use a global dependency injection solution, the services, repositories and APIs live in
some global container. Your tests must then register the mocks in that container before each test,
and remember to reset it afterwards. Forget the reset, and one test leaks its mocks into the next
one. Keep a stream, timer or database connection open inside a mock, and it survives the test that
created it.

With store injection, you provide the environment, dependencies and configuration as **parameters
when you create the store in the test**:

```dart
var store = Store<AppState>(
  initialState: AppState.initial(),
  environment: Environment.testing,
  dependencies: (store) => DependenciesTesting(),
  configuration: (store) => Config()..isABtestingOn = true,
);
```

As soon as the test ends and the store is disposed, the environment, dependencies and configuration
are disposed with it. There is no global state to set up and tear down, which makes tests less
verbose and less prone to memory leaks.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_dependency_injection.dart">
Dependency Injection Example</a>.

> _The dependency injection idea was contributed by <a href="https://github.com/craigomac">Craig McMahon</a>._
