---
sidebar_position: 2
---

# Comparing with Bloc

**Async Redux** allows you to create your app much faster
and a lot easier than with **Bloc plus Cubit**.

The single design difference which allows Async Redux to be so much more productive than Bloc,
is that Async Redux changes the state via **classes**, while Bloc/Cubit changes the state via **methods**.

This may seem like a small difference, but classes are made to be extended, while methods are not.
Because of this, Async Redux can and does provide a load of features out-of-the-box,
that are non-existent or hard to implement with Cubit.

At the end of this page we are going to talk about the only advantage Bloc/Cubit has over Async Redux.

## In more detail

Let's compare both tools in detail.

Both of them implement an MVI architecture.
Your widgets don't know **how** the state is changed, but only **what** should change.

In Async Redux you dispatch actions, while in Bloc you call Cubit methods,
both with a suitable name and payload that describe what should happen.
The code to trigger a state change from your widgets is very similar:

```dart
// Async Redux
dispatch(Increment(amount: 1));

// Bloc
counterCubit.increment(amount: 1);
```

In Async Redux, actions are classes that extend your `AppAction`,
while in Bloc, Cubit methods are just regular methods inside your Cubit class.

Actions change the state by returning a new state from their `reduce()` method,
while Cubit methods change the state by calling `emit(newState)`.

## Loading and error indicators

To show a loading indicator while an action is in progress,
and to show an error message if it fails,
you can use `isWaiting` and `isFailed` methods provided by Async Redux:

```dart
// State (no need for loading or error fields)
class AppState {
  final int counter;
  AppState({required this.counter});
}

// Action
class Increment extends AppAction {
  final int amount;
  Increment(this.amount);

  Future<AppState> reduce() async {
    // ... do async work
    return state.copy(counter: state.counter + amount);
  }
}

// Widget
if (context.isFailed(Increment)) return Text('Error');
else if (context.waiting(Increment)) return CircularProgressIndicator();
else return Text('Counter: ${context.state.counter}');
```

While in Bloc/Cubit, you need to implement this logic manually,
by adding `isLoading` and `error` fields to your state,
and updating them in your Cubit methods:

```dart
// State (needs isLoading and error fields)
class CounterState {
  final int counter;
  final bool isLoading;
  final String? error;
  CounterState({required this.counter, required this.isLoading, this.error});
}

// Cubit
class CounterCubit extends Cubit<CounterState> {
  CounterCubit() : super(CounterState(counter: 0, isLoading: false));

  Future<void> increment(int amount) async {
    emit(state.copy(isLoading: true, error: null));
    try {
      // ... do async work
      emit(state.copy(counter: state.counter + amount, isLoading: false));
    } catch (error) {
      emit(state.copy(isLoading: false, error: error.toString()));
    }
  }
}

// Widget
final state = context.watch<CounterCubit>().state;
if (state.error != null) return Text('Error');
else if (state.isLoading) return CircularProgressIndicator();
else return Text('Counter: ${state.counter}');
```

In other words, Async Redux provides built-in support for loading and error handling,
while in Bloc/Cubit you need to implement it yourself by adding fields to your state and
updating them in your Cubit methods.

## Showing an error dialog

With Async Redux, when an action fails you can simply throw an exception from its `reduce()` method.
Async Redux allows for a central error handling mechanism that is set up when the
store is created. In special, if an action fails because the user did something wrong,
you can throw a `UserException`, and Async Redux will automatically show an error dialog.

```dart
// Action
class Increment extends AppAction {
  final int amount;
  Increment(this.amount);
  
  AppState? reduce() {
    if (amount < 0) throw UserException('Amount cannot be negative');    
    return state.copy(counter: state.counter + amount);
  }
}

// Widget (no error handling needed)
Widget build(BuildContext context) {
  return ElevatedButton(
    onPressed: () => dispatch(Increment(amount)),
    child: Text('Increment'),
  );
}  
```

While in Bloc/Cubit, you need to implement this logic manually by listening for errors
in your widget and showing a dialog when an error occurs.

```dart
// Cubit
class CounterCubit extends Cubit<CounterState> {
  void increment(int amount) async {
    try {
      if (amount < 0) throw Exception('Amount cannot be negative');      
      emit(state.copy(counter: state.counter + amount));
    } catch (error) {
      emit(state.copy(error: error.toString()));
    }
  }
}

// Widget (must listen for errors and show dialog manually)
Widget build(BuildContext context) {
  return BlocListener<CounterCubit, CounterState>(
    listener: (context, state) {
      if (state.error != null) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: Text('Error'),
            content: Text(state.error!),
          ),
        );
      }
    },
    child: ElevatedButton(
      onPressed: () => context.read<CounterCubit>().increment(amount),
      child: Text('Increment'),
    ),
  );
}
```

> Note: Bloc/Cubit supports adding an error observer to `Bloc.observer`. That can be used to
> intercept errors globally with `onError` and show a dialog, but you cannot throw errors in
> your Cubit methods. You have to try/catch errors and use `addError()` manually.

## Transformations and features

Async Redux provides many built-in features that can be added to your actions.
For example, suppose you want to check for internet connectivity before executing an action,
then prevent re-entrance of the action while it's already running, and also retry the action
if it fails due to a network error. You also want to be able to show a loading indicator
while the action is in progress, and show an error in the screen if it fails.

To do it with Async Redux:

* Check for internet connectivity using the `with CheckInternet` mixin.
* Prevent re-entrance by using the `with NonReentrant` mixin.
* Retry the action using the `with Retry` mixin.
* You don't need to do anything to show a loading indicator, it's automatic.
* Also, no need to do anything to show an error in the screen, it's automatic.
       
This is how the action looks like:

```dart 
class LoadPrices extends AppAction with CheckInternet, NonReentrant, Retry { 
  Future<AppState> reduce() async {
    final prices = await repository.fetchPrices();
    return state.copy(prices: prices);
  }
}
``` 

While in Bloc/Cubit, you need to implement all this logic manually:

* Check for internet connectivity using the `connectivity_plus` package.
* Prevent re-entrance by using the `_isRunning` boolean flag.
* Retry the action using the `retry` package.
* Show a loading indicator by emitting a loading state `PricesLoading`.
* Handle errors by emitting an error state `PricesError`.

This is how the Cubit looks like:

```dart
class PricesCubit extends Cubit<PricesState> {  
  final PricesRepository repository;
  bool _isRunning = false;  

  PricesCubit(this.repository) : super(PricesInitial());

  Future<void> load() async {
    if (_isRunning) return;
    _isRunning = true;

    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      if (connectivityResult == ConnectivityResult.none) {
        emit(PricesError('No internet connection'));
        return;
      }

      emit(PricesLoading());

      // Using the `retry` package.
      final prices = await retry(
        () => repository.fetchPrices(),
        maxAttempts: 3,
        retryIf: (e) => e is SocketException || e is TimeoutException,
      );

      emit(PricesLoaded(prices));
    } catch (e) {
      emit(PricesError(e.toString()));
    } finally {
      _isRunning = false;
    }
  }
}
```

Is there any way to extract this logic to make it easier in Bloc/Cubit? Sure. Here's how:

```dart
class PricesCubit extends Cubit<PricesState> with CheckInternet, NonReentrant, Retry {  
  final PricesRepository repository;
  PricesCubit(this.repository) : super(PricesInitial());

  Future<void> load() async {
    await nonReentrant('load', () async {
      if (!await hasInternet()) {
        emit(PricesError('No internet connection'));
        return;
      }

      emit(PricesLoading());
      try {
        final prices = await retryWithBackoff(
          () => repository.fetchPrices(),
        );
        emit(PricesLoaded(prices));
      } catch (e) {
        emit(PricesError(e.toString()));
      }
    });
  }
}
```

Still, there is no comparison with the Async Redux version shown previously.
There is no way to add these features to Cubit methods automatically,
because they are just regular methods. Async Redux actions are classes,
so they can be extended with mixins that add features to them.

### Bloc transformers

Here's how to add non-reentrant, debounce and throttle features to an action with Async Redux:

```dart 
// Retry
class LoadPrices extends AppAction with Retry { ... }

// Debounce
class LoadPrices extends AppAction with Debounce { ... }

// Throttle
class LoadPrices extends AppAction with Throttle { ... }
```

In Bloc/Cubit, you need to implement this logic manually.
However, there is a simpler way to do it, as long as you revert to use pure Bloc (no Cubit)
and then use the `transformer` parameter. For example:

```dart
class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(SearchInitial()) {
    on<PerformSearch>(
      _onPerformSearch,
      transformer: droppable(), // Here!
    );
  }

  Future<void> _onPerformSearch(
    PerformSearch event,
    Emitter<SearchState> emit,
  ) async {
    emit(SearchLoading());
    final results = await repository.search(event.query);
    emit(SearchLoaded(results));
  }
}
```

Some available transformers:

* `droppable()`: ignore any events added while an event is processing
* `restartable()`: process only the latest event and cancel previous ones
* `concurrent()`: process events concurrently
* `sequential()`: process events sequentially
* `debounce()`: wait for a pause in events before processing the latest one
* `throttle()`: process the first event and ignore new events for a duration

Unfortunately, these transformers don't work when using Cubit methods, only with pure Bloc events.
These are a lot more verbose and complex than both Cubit and Async Redux.

### Optimistic Updates

Here's how to implement saving a value with optimistic updates in Async Redux:

```dart
class SaveTodo extends AppAction with OptimisticUpdate {
  final Todo newTodo;
  SaveTodo(this.newTodo);
  
  Object? newValue() => state.todoList.add(newTodo);  
  Object? getValueFromState(state) => state.todoList;  
  AppState applyValueToState(state, value) => state.copy(todoList: value);  
  Future<void> saveValue(value) => saveTodo(newTodo);
  Future<Object?> reloadValue() => loadTodoList();  
}
```

In Bloc/Cubit, you can do something very similar. First, define the following mixin:

```dart
mixin OptimisticUpdate<State> on Cubit<State> {
  
  Future<void> optimisticUpdate<T>({
    required T Function() newValue,
    required T Function(State state) getValueFromState,
    required State Function(State state, T value) applyState,
    required Future<void> Function(T value) saveValue,
    Future<T> Function()? reloadValue,
  }) async {
    final initialValue = getValueFromState(state);
    final _newValue = newValue();

    // 1. Optimistic update
    emit(applyState(state, _newValue));

    try {
      // 2. Save to server
      await saveValue(_newValue);
    } catch (e) {
      // 3. Rollback only if state still has our optimistic value
      if (getValueFromState(state) == _newValue) {
        emit(applyState(state, initialValue));
      }
      rethrow;
    } finally {
      // 4. Reload from server
      if (reloadValue != null) {
        try {
          final reloadedValue = await reloadValue();
          emit(applyState(state, reloadedValue));
        } catch (_) {}
      }
    }
  }
}
```

Then, use it like this:

```dart
class TodoCubit extends Cubit<AppState> with OptimisticUpdate<AppState> {
  final TodoRepository repository;
  
  TodoCubit(this.repository) : super(AppState.initial());

  Future<void> saveTodo(Todo newTodo) async {
    await optimisticUpdate<List<Todo>>(
      newValue: () => state.todoList.add(newTodo),
      getValueFromState: (state) => state.todoList,
      applyValueToState: (state, value) => state.copy(todoList: value),
      saveValue: (_) => repository.saveTodo(newTodo),
      reloadValue: () => repository.loadTodoList(),
    );
  }
}
```

## Fresh and Stale

Throttle etc

## Create your own mixins

ABORT-DISPATCH

## Action Status

if (action.isCompletedOk) Navigator.pop();

## Events

HOW DOES CUBIT HANDLE EVENTS?

## Persistence

HOW DOES CUBIT HANDLE LOCAL PERSISTENCE

## Testing

HOW DOES CUBIT HANDLE TESTING?

## Logging and Metrics

ASYNC REDUX KNOWS ABOUT THE LIFECYCLE OF ACTIONS AND CAN LOG THEM AUTOMATICALLY.
HOW DOES CUBIT HANDLE LOGGING AND METRICS?

## Refresh Indicator

HOW DOES CUBIT HANDLE REFRESH INDICATORS?

## Conclusion

Async Redux is more powerful than pure Bloc, while being simpler than Bloc plus Cubit.
