---
sidebar_position: 2
---

# Comparing with Bloc
  
The claim we are going to prove:

> Building your apps with **AsyncRedux** is much easier and faster than building them with **Bloc plus Cubit**.

## The design difference

What allows AsyncRedux to be so much more productive than Bloc/Cubit,
is that AsyncRedux changes state via **classes** (called "actions"), 
while Bloc/Cubit does it with **methods**.

This difference may seem small, but classes are made to be extended. 
Because of this, AsyncRedux can and does provide a load of features out-of-the-box,
that are non-existent or hard to implement with Cubit.

Classes also give you a stable, typed identifier (the action type) that you can use in many ways.

Let's see the practical advantages of AsyncRedux in detail, 
and then at the end of this page we are going to talk about the only advantage Bloc has over AsyncRedux.

## In more detail

Both AsyncRedux and Bloc implement an MVI architecture.
Your widgets don't know **how** the state is changed, but only **what** should change.

The code to trigger a state change from your widgets is very similar.
In AsyncRedux you dispatch actions, while in Cubit you call methods,
but in both you type a name and payload that describe what should happen:

```dart
// AsyncRedux
dispatch(Increment(amount: 1));

// Bloc/Cubit
counterCubit.increment(amount: 1);
```

In AsyncRedux, actions are classes that extend your `AppAction`,
while Bloc/Cubit just uses regular methods inside your Cubit class.

Actions change the state by returning a new state from their `reduce()` method,
while Cubit methods change the state by calling `emit(newState)`.

## Loading and error indicators

To show a loading indicator while an action is in progress,
and to show an error message if it fails,
you can use the `isWaiting` and `isFailed` methods provided by AsyncRedux:

```dart
// State (no need to add loading or error fields to the state)
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

In other words, AsyncRedux provides built-in support for loading indicators and error handling,
while in Bloc/Cubit you need to implement it yourself by adding fields to your state and
updating them in your Cubit methods.

## Showing an error dialog

With AsyncRedux, when an action fails you can just throw an exception from its `reduce()` method.
AsyncRedux allows for a central error handling mechanism that is set up when the
store is created. In special, if an action fails because the user did something wrong,
you can throw a `UserException`, and AsyncRedux will automatically show an error dialog.

```dart
// Action
class Increment extends AppAction {
  final int amount;
  Increment(this.amount);
  
  AppState? reduce() {
    if (amount < 0) throw UserException('Amount cannot be negative'); // Here!    
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

## Mixins 

AsyncRedux provides many built-in mixins that can be added to your actions.
For example, suppose you want to check for internet connectivity before executing an action,
then prevent re-entrance of the action while it's already running, and also retry the action
if it fails due to a network error. You also want to be able to show a loading indicator
while the action is in progress, and show an error in the screen if it fails.

To do it with AsyncRedux:

* Check for internet connectivity using the `with CheckInternet` mixin.
* Prevent re-entrance by using the `with NonReentrant` mixin.
* Retry the action using the `with Retry` mixin.
* You don't need to do anything to show a loading indicator, it's automatic.
* Also, no need to do anything to show an error in the screen, it's automatic.
       
This is what the action looks like:

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

This is what the Cubit looks like:

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

Still, there is no comparison with the AsyncRedux version shown previously.
There is no way to add these features to Cubit methods automatically,
because they are just regular methods. AsyncRedux actions are classes,
so they can be extended with mixins that add features to them.

### Bloc transformers

Here's how to add non-reentrant, debounce, throttle and Fresh mixins to an action with AsyncRedux:

```dart 
// Retry
class LoadPrices extends AppAction with Retry { ... }

// Debounce
class LoadPrices extends AppAction with Debounce { ... }

// Throttle
class LoadPrices extends AppAction with Throttle { ... }

// Fresh
class LoadPrices extends AppAction with Fresh { ... }
```

In Bloc/Cubit, you need to implement all this logic manually.
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
These are a lot more verbose and complex than both Cubit and AsyncRedux.

## Refresh indicators

In AsyncRedux, you can use the `dispatchAndWait()` method to show a refresh indicator while an action is in progress:

```dart
return RefreshIndicator(
    onRefresh: dispatchAndWait(DownloadStuffAction());
    child: ListView(...),
```                 

In Bloc/Cubit, you need to implement this logic manually by adding a loading state to your Cubit:

```dart
// Add fields that let the UI show loading.
class ItemsState {
  final List<Item> items;
  final bool isRefreshing;

  const ItemsState({
    required this.items,
    this.isRefreshing = false,
  });

  ItemsState copyWith({
    List<Item>? items,
    bool? isRefreshing,
  }) {
    return ItemsState(
      items: items ?? this.items,
      isRefreshing: isRefreshing ?? this.isRefreshing,
    );
  }
}

// Put the refresh logic in the Cubit and return a Future
class ItemsCubit extends Cubit<ItemsState> {
  final ItemsRepository repo;
  ItemsCubit(this.repo) : super(const ItemsState(items: []));

  Future<void> refresh() async {
    emit(state.copyWith(isRefreshing: true));
    final items = await repo.fetchItems();
    emit(state.copyWith(items: items, isRefreshing: false));
  }
}

// Use it from RefreshIndicator
return RefreshIndicator(
  onRefresh: () => context.read<ItemsCubit>().refresh(),
  child: ListView(...),
);
```

## Side effects

Here is how you would change the text in a `TextField` after an action is dispatched in AsyncRedux:

```dart
// The state
class AppState {
  final Evt<String> changeEvt;
  AppState({Evt<String>? changeEvt}) : changeEvt = changeEvt ?? Evt<String>.spent();
  
  AppState copy({Evt<String>? changeEvt}) 
    => AppState(changeEvt: changeEvt ?? this.changeEvt);
}

// The action
class ChangeText extends AppAction {    
  Future<AppState> reduce() async {
    String newText = await fetchTextFromApi();
    return state.copy(changeEvt: Evt<String>(newText)); // Here!
  }
}

// In the widget    
Widget build(BuildContext context) {
  String? newText = context.event((st) => st.changeEvt);
  if (newText != null) controller.text = newText;
  
  return TextField(controller: controller);
}
```

And this is how you would do it in Bloc/Cubit. 
There is no built-in equivalent to AsyncRedux `Evt`, 
so you have to add extra state fields (a token counter) 
and wire up a `BlocListener` to perform the one-time side effect.

```dart
class AppState {
  final String changeText;
  final int changeTextToken;
  const AppState({this.changeText = '', this.changeTextToken = 0});

  AppState copyWith({String? changeText, int? changeTextToken}) 
    => AppState(
      changeText: changeText ?? this.changeText,
      changeTextToken: changeTextToken ?? this.changeTextToken,
    );  
}

class AppCubit extends Cubit<AppState> {
  AppCubit() : super(const AppState());

  Future<void> changeText() async {
    final newText = await fetchTextFromApi();
    emit(state.copyWith(
      changeText: newText,
      changeTextToken: state.changeTextToken + 1,
    ));
  }
}

// In the widget
Widget build(BuildContext context) {
  return BlocListener<AppCubit, AppState>(
    listenWhen: (prev, next) => prev.changeTextToken != next.changeTextToken,
    listener: (context, state) {      
      controller.text = state.changeText;
    },
    child: TextField(controller: controller),
  );
}
```

---

# Similarities

For completeness, here are some features that can be implemented with a similar amount of code
in both AsyncRedux and Bloc/Cubit.

### Optimistic Updates

Here's how to implement saving a value with optimistic updates in AsyncRedux,
by using `with OptimisticCommand`:

```dart
class SaveTodo extends AppAction with OptimisticCommand {
  final Todo newTodo;
  SaveTodo(this.newTodo);

  Object? optimisticValue() => state.todoList.add(newTodo);
  Object? getValueFromState(AppState state) => state.todoList;
  AppState applyValueToState(AppState state, Object? value) => state.copy(todoList: value);
  Future<Object?> sendCommandToServer(Object? value) => saveTodo(newTodo);
  Future<Object?> reloadFromServer() => loadTodoList();
}
```

In Bloc/Cubit, you can do something similar. First, define the following mixin:

```dart
mixin OptimisticCommand<State> on Cubit<State> {
  
  Future<void> OptimisticCommand<T>({
    required T Function() optimisticValue,
    required T Function(State state) getValueFromState,
    required State Function(State state, T value) applyState,
    required Future<void> Function(T value) sendCommandToServer,
    Future<T> Function()? reloadFromServer,
  }) async {
    final initialValue = getValueFromState(state);
    final _optimisticValue = optimisticValue();

    // 1. Optimistic update
    emit(applyState(state, _optimisticValue));

    try {
      // 2. Save to server
      await sendCommandToServer(_optimisticValue);
    } catch (e) {
      // 3. Rollback only if state still has our optimistic value
      if (getValueFromState(state) == _optimisticValue) {
        emit(applyState(state, initialValue));
      }
      rethrow;
    } finally {
      // 4. Reload from server
      if (reloadFromServer != null) {
        try {
          final reloadedValue = await reloadFromServer();
          emit(applyState(state, reloadedValue));
        } catch (_) {}
      }
    }
  }
}
```

Then, use it like this:

```dart
class TodoCubit extends Cubit<AppState> with OptimisticCommand<AppState> {
  final TodoRepository repository;
  
  TodoCubit(this.repository) : super(AppState.initial());

  Future<void> saveTodo(Todo newTodo) async {
    await OptimisticCommand<List<Todo>>(
      optimisticValue: () => state.todoList.add(newTodo),
      getValueFromState: (state) => state.todoList,
      applyValueToState: (state, value) => state.copy(todoList: value),
      sendCommandToServer: (_) => repository.saveTodo(newTodo),
      reloadFromServer: () => repository.loadTodoList(),
    );
  }
}
```

## Action status

Suppose you want to load some information and then pop the current screen only if the loading succeeded.

Here's how to do it with AsyncRedux, using the `status.isCompletedOk` property:

```dart
class SaveUserAction extends AppAction {
  final String userName;
  SaveUserAction(this.userName);
  
  Future<AppState?> reduce() async {
    final Id? userId = await repo.saveUser(userName);
    if (userId == null) throw UserException('Save failed');    
    return state.copyWith(user: User(userId, name: userName));
  }
}

// In the widget
onPressed: () async {
  var status = await dispatchAndWait(SaveUserAction(userName));
  if (status.isCompletedOk && context.mounted) Navigator.pop(context);
}
```

To do it with Bloc/Cubit, your Cubit method should return `true` in case of success:

```dart
class UserCubit extends Cubit<UserState> {
  final UserRepository repo;
  UserCubit(this.repo) : super(null);

  Future<bool> saveUser(String userName) async {
    final Id? userId = await repo.saveUser(userName);
    final bool success = (userId != null);
    if (success) emit(state.copyWith(user: User(userId!, name: userName)));
    return success;
  }
}

// In the widget
onPressed: () async {
  var ok = await context.read<UserCubit>().saveUser(userName);
  if (ok && context.mounted) Navigator.pop(context);
}                
```

[//]: # (## Create your own mixins)
[//]: # (ABORT-DISPATCH)

[//]: # (## Persistence)
[//]: # (HOW DOES CUBIT HANDLE LOCAL PERSISTENCE)

[//]: # (## Testing)
[//]: # (HOW DOES CUBIT HANDLE TESTING?)

[//]: # (## Logging and Metrics)
[//]: # (ASYNC REDUX KNOWS ABOUT THE LIFECYCLE OF ACTIONS AND CAN LOG THEM AUTOMATICALLY.)
[//]: # (HOW DOES CUBIT HANDLE LOGGING AND METRICS?)

[//]: # (## Conclusion)
[//]: # (AsyncRedux is more powerful than pure Bloc, while being simpler than Bloc plus Cubit.)
