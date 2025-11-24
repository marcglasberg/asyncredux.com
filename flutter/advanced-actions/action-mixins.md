---
sidebar_position: 4
---

# Action mixins

You can add **mixins** to your actions to handle common tasks.
For example, instead of writing:

```dart
class LoadText extends AppAction { ...
```

You can write:

```dart
class LoadText extends AppAction with CheckInternet { ...
```

Sometimes you can even combine multiple mixins:

```dart
class LoadText extends AppAction with CheckInternet, NonReentrant, Retry { ...
```

Let's see the available mixins.

---

## Check for Internet connectivity

Mixin `CheckInternet` makes sure actions only run when there is internet.
If there is no internet, an **error dialog** will ask the user to check their connection:

```dart
class LoadText extends AppAction with CheckInternet {      
   Future<String> reduce() async {
      var response = await http.get('https://dummyjson.com/todos/1');
      ...      
   }
}   
```

It automatically checks the connection before running the action.
If there is no internet, the action stops and shows a dialog with
title _'There is no Internet' and content: 'Please, verify your connection.'_.

If you do not want the dialog to open, add the `NoDialog` mixin.
Then you can show the error in your widgets:

```dart
class LoadText extends AppAction with CheckInternet, NoDialog { 
  ... 
  }

// Then, in your widget:
Widget build(context) {     
  if (context.isFailed(LoadText)) {
    var message = context.exceptionFor(LoadText)?.errorText ?? 'No Internet connection';
    return Text(message);    
  }
}   
```

**Notes:**

* `CheckInternet` only checks if the device has internet on or off. It does not check if the internet provider is
  working or if the server is available. So it may pass the check but still fail requests.

* You can customize the dialog or `errorText` by overriding `connectionException()`,
  which is a method added by the mixin to your action, and returning a custom `UserException`.

**Compatibility:**

* `CheckInternet` can be safely combined with `NonReentrant` or `Throttle` (but not both).
* Should **not** be combined with mixins that override `before`.
* Should **not** be combined with other internet check mixins like `AbortWhenNoInternet` or
  `UnlimitedRetryCheckInternet`.

## Retry until there is internet connectivity

Mixin `UnlimitedRetryCheckInternet` retries the action until there is internet.
If there is no internet, it aborts silently and keeps retrying the `reduce` method without limit.
It also retries if there is internet but the action fails.

Just add it like this:

```dart
class LoadText extends AppAction UnlimitedRetryCheckInternet {
  Future<String> reduce() async {
    var response = await http.get('http://numbersapi.com/42');
    return response.body;
  }
}
```

**Notes:**

* This mixin replaces `Retry`, `UnlimitedRetries`, `AbortWhenNoInternet`, and `NonReentrant`. Do **not** combine it with
  those.

* If your `before` method throws an error, retries will **not** happen.

* All retries are printed to the console. To disable or customize this, override `printRetries()`:

  ```dart
  void printRetries(String message) {}
  ```

* `UnlimitedRetryCheckInternet` only checks if internet is on or off.
  It does not check if the internet provider is
  working or if the server is available. So it may pass the check but still fail requests.

**Compatibility:**

* `UnlimitedRetryCheckInternet` should **not** be combined with mixins that override `wrapReduce` or `abortDispatch`.
* Should **not** be combined with other internet check mixins like `CheckInternet` or `AbortWhenNoInternet`.

## Abort the action when there is no Internet

Mixin `AbortWhenNoInternet` aborts the action silently (without showing any dialogs) if there is no
internet connection:

```dart
class LoadText extends AppAction with AbortWhenNoInternet {
  Future<String> reduce() async {
    var response = await http.get('http://numbersapi.com/42');
    return response.body;
  }
}
```

**Notes:**

* `AbortWhenNoInternet` only checks if internet is on or off.
  It does not check if the internet provider is
  working or if the server is available. So it may pass the check but still fail requests.

**Compatibility:**

* `AbortWhenNoInternet` can be safely combined with `NonReentrant` or `Throttle` (but not both).
* Should **not** be combined with mixins that override `before`.
* Should **not** be combined with other internet check mixins like `CheckInternet` or `UnlimitedRetryCheckInternet`.

---

## NonReentrant

To prevent an action from running while it is already running, add `NonReentrant`:

```dart
class LoadText extends AppAction with NonReentrant {
  ...
}
```

If an action of the same runtime-type is still running, the new one is aborted.

**Compatibility:**

* `NonReentrant` be safely combined with `Retry`, `CheckInternet`, `UnlimitedRetryCheckInternet`,
  `AbortWhenNoInternet`, and `NoDialog`.
* Should **not** be combined with mixins that override `abortDispatch`.
* Should **not** be combined with `Throttle`.

---

## Retry

Use the `Retry` mixin to retry actions a few times with exponential backoff when they fail:

```dart
class LoadText extends AppAction with Retry, UnlimitedRetries {
  ...
}
```

The `reduce` method is retried only if it throws an error.
If the `before` method throws, retries will **not** happen.

All actions using `Retry` become asynchronous, even if originally synchronous.

You can override these parameters:

* `initialDelay`: The delay before the first retry attempt. Default is `350` milliseconds.

* `multiplier`: The factor by which the delay increases for each later retry.
  Default is `2`, meaning default delays of: 350 millis, 700 millis, and 1.4 seconds.

* `maxRetries`: The maximum number of retries before giving up. Default is `3`,
  meaning it will try a total of 4 times.

* `maxDelay`: The maximum delay between retries to avoid excessively long wait times. Default is `5` secs.

Retry delays start after the reducer finishes. Example:
If `reduce()` fails after 1 second and `initialDelay` is 350 ms, the retry happens 1.35 seconds after start.

When the action finally fails (`maxRetries` is reached),
the last error is thrown, and the previous ones will be ignored.

To retry unlimited times, use `UnlimitedRetries`,
which is the same as setting `maxRetries` to `-1`:

```dart
class MyAction extends AppAction with Retry, UnlimitedRetries { ... 
```

**Notes:**

* If you use `await dispatchAndWait(action)` and the action uses `UnlimitedRetries`,
  it may never finish if it keeps failing. Be careful.

* If you want to fail an action when there is no internet, but keep trying unlimited times until the
  internet is back, use the `UnlimitedRetryCheckInternet` mixin instead of `Retry`.

**Compatibility:**

* `Retry` should **not** be combined with `CheckInternet`, `AbortWhenNoInternet`, or `UnlimitedRetryCheckInternet`.
* Should **not** be combined with mixins that override `wrapReduce`.

* For most actions using `Retry`, also add `NonReentrant`:

  ```dart
  class MyAction extends AppAction with Retry, NonReentrant { ... }
  ```

---

## Throttle

Mixin `Throttle` ensures the action runs at most once during a given time period.
In other words, it prevents the action from running too frequently.

If the action is dispatched multiple times during that period, only the first one runs.
After the throttle period passes, it's allowed to run again, and the period resets.

### Fresh and stale

If the action loads information, you can think of the throttle period as how long the information stays _"fresh"_.
After that time, it is considered _"stale"_ and the action is allowed to load it again.

For example, if you are using a `StatefulWidget` that needs to load some information when the widget is created,
you can dispatch the loading action in its `initState()`:

```dart
void initState() {
  super.initState();
  context.dispatch(LoadAction());
}
``` 

Or, if you are using a `StoreConnector`, you can use its `onInit` parameter:

```dart
StoreConnector<AppState, _Vm>(
  onInit: _onInit, // Here!
  ...
  
void _onInit(store) => store.dispatch(LoadAction());  
```

The load action can specify a throttle period so that it doesn't load the information again too often:

```dart
class LoadAction extends AppAction with Throttle {

  final int throttle = 5000;

  Future<AppState?> reduce() async {
    var information = await loadInformation();
    return state.copy(information: information);
  }
}
```

Note the `throttle` is given in milliseconds, and the default is 1000 (1 second).
This default was overridden in the example above to 5000 millis (5 seconds).

### Bypassing the throttle

You can also selectively bypass the throttle using `ignoreThrottle`:

```dart
class MyAction extends AppAction with Throttle {
  final bool force;
  MyAction({this.force = false});  
      
  bool get ignoreThrottle => force; // Here!   
  ...
}
```

If the action fails, the throttle period is **not** reset. In other words,
if the action fails it will not run a second time if you dispatch it again within the throttle period.
To change this behavior, use `removeLockOnError`.
It will allow the action to run again, right away:

```dart
class MyAction extends AppAction with Throttle {
  bool removeLockOnError = true; // Here!
  ...
}
```

Note that `Throttle` implements `removeLockOnError` by overriding the action's `after()` method.
You can override it yourself if you want to remove the lock only when conditions you define are met.

```dart
void after() {
  if (removeLockOnError && (status.originalError != null)) removeLock();
}
```

## Advanced throttle usage

By default, throttling is based on the action's `runtimeType`.
This means an action will be throttled
if another action with the same `runtimeType` was dispatched during the throttle period.
In short, the `runtimeType` works as the _"lock"_.
If you want to use a different lock, you can override the `lockBuilder` method.

For example, here we throttle two different actions using the same lock:

```dart
class MyAction1 extends AppAction with Throttle {
  Object? lockBuilder() => 'myLock';
  ...
}

class MyAction2 extends AppAction with Throttle {
  Object? lockBuilder() => 'myLock';
  ...
}
```

Another example is to throttle based on some field of the action:

```dart
class MyAction extends AppAction with Throttle {
  final String lock;
  MyAction(this.lock);
  Object? lockBuilder() => lock;
  ...
}
```

**Compatibility:**

* `Throttle` should **not** be combined with `NonReentrant` or `UnlimitedRetryCheckInternet`.
* Should **not** be combined with other mixins that override `abortDispatch`.

---

## Debounce

Debouncing delays the execution of a function until after a certain period of inactivity.
Each time the debounced function is called, the period of inactivity (or wait time) is reset.

The function will only execute after it stops being called for the duration of the wait time.
This is useful when you want to prevent a function from running too often and only run it after some "quiet time".

A common example is input validation in text fields.
You may not want to validate the text on every key press,
but only after the user has stopped typing for a moment. Example:

```dart
class SearchText extends AppAction with Debounce {  
  final String searchTerm;
  SearchText(this.searchTerm);  

  Future<AppState> reduce() async {
      
    var response = await http.get(
      Uri.parse('https://example.com/?q=' + encoded(searchTerm))
    );
        
    return state.copy(searchResult: response.body);
  }
}
```

The `debounce` value is given in milliseconds,
and the default is 333 millis (one third of a second).
You can override this default:

```dart
class SearchText extends AppAction with Debounce {
  final int debounce = 1000; // Here!
  ...
}
```

### Advanced debounce usage

By default, the debounce is based on the action's `runtimeType`.
This means the debounce period resets when another action of the same type is dispatched
within that period. In other words, the runtime type is the _"lock"_.

If you want to debounce based on a different lock, you can override the `lockBuilder` method.
Here is an example where two actions share the same lock:

```dart
class MyAction1 extends AppAction with Debounce {
  Object? lockBuilder() => 'myLock';
  ...
}
  
class MyAction2 extends AppAction with Debounce {
  Object? lockBuilder() => 'myLock';
  ...
}
```

Another example is to debounce based on some field of the action:

```dart
class MyAction extends AppAction with Debounce {
  final String lock;
  MyAction(this.lock);
  Object? lockBuilder() => lock;
  ...
}
```

**Compatibility:**

* `Debounce` should **not** be combined with `Retry` or `UnlimitedRetryCheckInternet`.
* Should **not** be combined with other mixins that override `wrapReduce`.

---

## OptimisticUpdate

To provide instant feedback on actions that save information to the server,
the `OptimisticUpdate` mixin immediately applies changes to the Redux state,
as if the save had already finished successfully, before confirming with the server.
If the server update then fails, the change is rolled back and, optionally, a notification can inform
the user of the issue.

The `OptimisticUpdate` mixin is available, but it is still **experimental**. You can use it, but test it well.

Let's use a simple "Todo" app as an example. We want to save a new Todo to a TodoList.
The code below saves the Todo, then reloads the whole TodoList from the cloud:

```dart
class SaveTodo extends AppAction {
  final Todo newTodo;
  SaveTodo(this.newTodo);

  Future<AppState> reduce() async {

    try {
      // Saves the new Todo to the cloud.
      await saveTodo(newTodo);
      }
    finally {
      // Loads the complete TodoList from the cloud.
      var reloadedTodoList = await loadTodoList();
      return state.copy(todoList: reloadedTodoList);
    }
  }
}
```

The problem is that updating the screen may take a second, 
since it waits for both saving and loading to finish. 
This delay hurts the user experience.

The solution is optimistically updating the TodoList right away, and only then save it to the cloud:

```dart
class SaveTodo extends AppAction {
  final Todo newTodo;
  SaveTodo(this.newTodo);

  Future<AppState> reduce() async {

    // Updates the TodoList optimistically.
    dispatch(UpdateStateAction((state) => state.copy(todoList: state.todoList.add(newTodo))));

    try {
      // Saves the new Todo to the cloud.
      await saveTodo(newTodo);
      }
    finally {
      // Loads the complete TodoList from the cloud.
      var reloadedTodoList = await loadTodoList();
      return state.copy(todoList: reloadedTodoList);
    }
  }
}
```

This is faster. The user sees the new Todo right away.
But if saving fails, they still have to wait for the reload to see the rollback. We can improve that:

```dart
class SaveTodo extends AppAction {
  final Todo newTodo;
  SaveTodo(this.newTodo);

  Future<AppState> reduce() async {

    // Updates the TodoList optimistically.
    var newTodoList = state.todoList.add(newTodo);
    dispatch(UpdateStateAction((state) => state.copy(todoList: newTodoList)));

    try {
      // Saves the new Todo to the cloud.
      await saveTodo(newTodo);
    }
    catch (e) {
      // If the state still contains our optimistic update, we rollback.
      // If the state now contains something else, we DO NOT rollback.
      if (state.todoList == newTodoList) {
        return state.copy(todoList: initialState.todoList); // Rollback.
      }
    }
    finally {
      // Loads the complete TodoList from the cloud.
      var reloadedTodoList = await loadTodoList();
      dispatch(UpdateStateAction((state) => state.copy(todoList: reloadedTodoList)));
    }
  }
}
```

Now the rollback happens right away if saving fails, so the user sees feedback instantly.

Note: If you are using a realtime database or Websockets to receive live updates, 
you may not need the finally block above, as long as the `newTodoList` above can be
told apart from the current `state.todoList`. This can be a problem if the state in question
is a primitive (boolean, number etc) or string.

### Mixin usage

The mixin helps you implement the above logic. You must provide the following:

* `newValue`: The new value that should appear in the state right away.
  For example, to add a Todo:

  ```dart
  Object? newValue() 
    => state.todoList.add(newTodo);
  ```

* `getValueFromState`: Extracts the value from the state. Example:

  ```dart
  Object? getValueFromState(state) 
    => state.todoList;
  ```

* `applyState`: Applies the value to the state. Example:

  ```dart
  AppState applyState(newTodoList, state) 
    => state.copy(todoList: newTodoList);
  ```

* `saveValue`: Saves the value to the cloud. Example:

  ```dart
  Future<void> saveValue(todo) 
    => saveTodo(todo);
  ```

* `reloadValue`: Reloads the value from the cloud. Omit this if you want to skip reloading. Example:

  ```dart
  Future<Object?> reloadValue() 
    => loadTodoList();
  ```
                        
Here is the complete example using the mixin:

```dart
class SaveTodo extends AppAction with OptimisticUpdate {
  final Todo newTodo;
  SaveTodo(this.newTodo);

  // The optimistic value to be applied right away.
  Object? newValue() 
    => state.todoList.add(newTodo);  

  // Read the current value from the state.
  Object? getValueFromState(AppState state) 
    => state.todoList;  

  // Apply thr value to the state.
  AppState applyState(AppState state, Object? value) 
    => state.copy(todoList: value);  

  // Save the value to the cloud.
  Future<void> saveValue(Object? value) async 
    => await saveTodo(newTodo);

  // Reload the value from the cloud. Omit to not reload.
  Future<Object?> reloadValue() async 
    => await loadTodoList();  
}

```
