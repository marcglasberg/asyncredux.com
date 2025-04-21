---
sidebar_position: 5
---

# Action mixins

You can add **mixins** to your actions, to accomplish common tasks.

## Check for Internet connectivity

`CheckInternet` ensures actions only run with internet,
otherwise an **error dialog** prompts users to check their connection:

```dart
class LoadText extends AppAction with CheckInternet {
      
   Future<String> reduce() async {
      var response = await http.get('https://dummyjson.com/todos/1');
      ...      
   }
}   
```

It will automatically check if there is internet before running the action.
If there is no internet, the action will fail, stop executing, and will show a dialog to the user with title:
_'There is no Internet' and content: 'Please, verify your connection.'_.

If you don't want the dialog to open, you can add the `NoDialog` mixin too,
and then display the error information in your widgets:

```dart
class LoadText extends AppAction with CheckInternet, NoDialog { 
  ... 
  }

class MyWidget extends StatelessWidget {
  Widget build(context) {     
     if (context.isFailed(LoadText)) Text('No Internet connection');
  }
}   
```

Or, using the exception message itself:

```dart
if (context.isFailed(LoadText)) Text(context.exceptionFor(LoadText)?.errorText ?? 'No Internet connection');
```

Notes:

* `CheckInternet` only checks if the internet is on or off on the device, not if the internet provider is
  really providing the service or if the server is available. So, it is possible that the check passes
  but internet requests still fail.

* If you want to customize the dialog or the `errorText`, you can override method `connectionException()`,
  which is a method added by the mixin to your action, and then return a `UserException` with the desired message.

Compatibility:

* The `CheckInternet` mixin can safely be combined with `NonReentrant` or `Throttle` (not both).

* It should **not** be combined with other mixins that override `before`.

* It should **not** be combined with other mixins that check the internet connection, like `AbortWhenNoInternet`
  or `UnlimitedRetryCheckInternet`.
  
### Retry until there is internet connectivity

Mixin `UnlimitedRetryCheckInternet` can be used to check if there is internet when you run some action that needs it.
If there is no internet, the action will abort silently, and then retry the `reduce` method unlimited times,
until there is internet. It will also retry if there is internet but the action failed.

Just add `with UnlimitedRetryCheckInternet` to your action. For example:

```dart
class LoadText extends AppAction UnlimitedRetryCheckInternet {
  Future<String> reduce() async {
    var response = await http.get('http://numbersapi.com/42');
    return response.body;
  }
}
```

Notes:

* This mixin combines `Retry`, `UnlimitedRetries`, `AbortWhenNoInternet` and `NonReentrant` mixins.
  You should **not** combone it with those mixins.

* Make sure your `before` method does not throw an error, or the retry will **not** happen.

* All retries will be printed to the console. To remove the print message, or if you want to log the retries,
  override method `printRetries()`:
  
  ```dart
  void printRetries(String message) {}
  ```

* `UnlimitedRetryCheckInternet` only checks if the internet is on or off on the device, not if the internet
  provider is really providing the service or if the server is available. So, it is possible that the check passes
  but internet requests still fail.

Compatibility:

* The `UnlimitedRetryCheckInternet` mixin should **not** be combined with other mixins that
  override `wrapReduce` or `abortDispatch`.
  
* It should **not** be combined with other mixins that check the internet connection, like `CheckInternet`
  and `AbortWhenNoInternet`.

### Abort the action when there is no Internet

`AbortWhenNoInternet` aborts the action silently (without showing any dialogs) if there is no
internet connection. For example:

```dart
class LoadText extends AppAction with AbortWhenNoInternet {
  Future<String> reduce() async {
    var response = await http.get('http://numbersapi.com/42');
    return response.body;
  }
}
```

Notes:

* `AbortWhenNoInternet` only checks if the internet is on or off on the device, not if the internet provider is
  really providing the service or if the server is available. So, it is possible that the check passes
  but internet requests still fail.

* If you want to customize the dialog or the `errorText`, you can override method `connectionException()`,
  which is a method added by the mixin to your action, and then return a `UserException` with the desired message.

Compatibility:

* The `AbortWhenNoInternet` mixin can safely be combined with `NonReentrant` or `Throttle` (not both at the same time).

* It should **not** be combined with other mixins that override `before`.

* It should **not** be combined with other mixins that check the internet connection, like `CheckInternet`
  or `UnlimitedRetryCheckInternet`.

## NonReentrant

To prevent an action from being dispatched while it's already running,
add the `NonReentrant` mixin to your action class:

```dart
class LoadText extends AppAction with NonReentrant {
   ...
   }
```

In other words, a dispatched action will be aborted in case an action of the same runtime-type is still
running from a previous dispatch.

Compatibility:

* The `NonReentrant` mixin can safely be combined with `Retry`,
  `CheckInternet`, `UnlimitedRetryCheckInternet`, `AbortWhenNoInternet` and `NoDialog`.

* It should **not** be combined with other mixins that override `abortDispatch`.

* It should **not** be combined with `Throttle`.

## Retry

Add the `Retry` mixin to your actions, to retry them a few times with exponential backoff, if they fail.

```dart
class LoadText extends AppAction with Retry, UnlimitedRetries {
   ...
   }
```

In more detail: The action's `reduce` method will be retried in case this method throws an error.
Note, if the `before` method throws an error, the retry will **not** happen.

Keep in mind that all actions using the `Retry` mixin will become asynchronous,
even if the original action was synchronous.

You can override the following parameters:

* `initialDelay`: The delay before the first retry attempt. Default is `350` milliseconds.

* `multiplier`: The factor by which the delay increases for each subsequent retry.
  Default is `2`, which means the default delays are: 350 millis, 700 millis, and 1.4 seg.

* `maxRetries`: The maximum number of retries before giving up. Default is `3`,
  meaning it will try a total of 4 times.

* `maxDelay`: The maximum delay between retries to avoid excessively long wait times. Default is `5` seconds.

Note the retry delays only start after the reducer finishes executing. For example,
if the reducer takes 1 second to fail, and the retry delay is 350 millis, the first
retry will happen 1.35 seconds after the first reducer started.

When the action finally fails (`maxRetries` was reached),
the last error will be rethrown, and the previous ones will be ignored.

If you want to retry unlimited times, you can add the `UnlimitedRetries` mixin,
which is the same as setting `maxRetries` to `-1`:

```dart
class MyAction extends AppAction with Retry, UnlimitedRetries { ... }
```

Notes:

* If you do `await dispatchAndWait(action)` and the action uses `UnlimitedRetries`,
  it may never finish if it keeps failing. So, be careful when using it.

* If you want to fail an action when there is no internet, but keep trying unlimited times until the
  internet is back, use the `UnlimitedRetryCheckInternet` mixin instead of `Retry`.

Compatibility:

* The `Retry` minin should **not** be combined with `CheckInternet`, `AbortWhenNoInternet`
  or `UnlimitedRetryCheckInternet`.

* The `Retry` mixin should **not** be combined with other mixins that override `wrapReduce`.

* For most actions that use `Retry`, consider also adding `NonReentrant`,
 to avoid multiple instances of the same action running at the same time:

  ```dart
  class MyAction extends AppAction with Retry, NonReentrant { ... }
  ```

## Throttle

Add the `Throttle` mixin to ensure the action will be dispatched at most once in a specified throttle period.
In other words, it prevents the action from running too frequently.

If an action is dispatched multiple times within a throttle period, it will only execute the first time,
and the others will be aborted. After the throttle period has passed, the action will be allowed to execute again,
which will reset the throttle period.

If you use the action to load information, the throttle period may be considered as the time the loaded information
is _"fresh"_. After the throttle period, the information is considered _"stale"_ and the action will be allowed to
load the information again.

For example, if you are using a `StatefulWidget` that needs to load some information, you can dispatch the loading
action when widget is created, and specify a throttle period so that it doesn't load the information again too often.

Or if you are using a `StoreConnector`, you can use the `onInit` parameter:

```dart
class MyScreenConnector extends StatelessWidget {
  Widget build(BuildContext context) => StoreConnector<AppState, _Vm>(
    vm: () => _Factory(),
    onInit: _onInit, // Here!
    builder: (context, vm) {
      return MyScreenConnector(
        information: vm.information,
        ...
      ),
    );

  void _onInit(Store<AppState> store) {
    store.dispatch(LoadAction());
  }
}
```

and then:

```dart
class LoadAction extends AppAction with Throttle {

  final int throttle = 5000;

  Future<AppState?> reduce() async {
    var information = await loadInformation();
    return state.copy(information: information);
  }
}
```

The `throttle` is given in milliseconds, and the default is`1000 milliseconds (1 second).
You can override this default:

```dart
class MyAction extends AppAction with Throttle {
    final int throttle = 500; // Here!
    ...
}
```

You can also specify the `ignoreThrottle` parameter, which allows you to ignore the throttle period
for a specific action. This is useful when you want to bypass the throttle for certain actions,
while still applying it to others. For example:

```dart
class MyAction extends ReduxAction<AppState> with Throttle {
    final bool force;
    MyAction({this.force = false});  

    bool get ignoreThrottle => force; // Here!   
    ...
}
```
  
The throttle period is NOT reset if the action fails.
In other words, if the action fails it will not run a second time if you dispatch it again within the throttle period.
However, you can use the `removeLockOnError` parameter to remove the lock when an error occurs,
allowing the action to be dispatched again right away.

```dart
class MyAction extends ReduxAction<AppState> with Throttle {
    bool removeLockOnError = true; // Here!
    ...
}
```

Note that `removeLockOnError` is currently implemented in the `after` method, like this:

```dart
@override
void after() {
  if (removeLockOnError && (status.originalError != null)) removeLock();
}
```

You can override the `after` method to customize this behavior of removing the lock under some conditions.

### Advanced throttle usage

The throttle is, by default, based on the action `runtimeType`.
This means it will throttle an action if another action of the same runtimeType was previously dispatched
within the throttle period. In other words, the runtimeType is the "lock". If you want to throttle based on a
different lock, you can override the `lockBuilder` method.
For example, here we throttle two different actions based on the same lock:

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

Compatibility:

* The `Throttle` mixin should **not** be combined with `NonReentrant` or or `UnlimitedRetryCheckInternet`.
* It should **not** be combined with other mixins that override `abortDispatch`.

## Debounce

Debouncing delays the execution of a function until after a certain period of inactivity.
Each time the debounced function is called, the period of inactivity (or wait time) is reset.

The function will only execute after it stops being called for the duration of the wait time.
Debouncing is useful in situations where you want to ensure that a function is not called too frequently
and only runs after some “quiet time.”

For example, it’s commonly used for handling input validation in text fields,
where you might not want to validate the input every time the user presses a key,
but rather after they've stopped typing for a certain amount of time. For example:

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

The `debounce` value is given in milliseconds, and the default is 333 milliseconds (1/3 of a second).
You can override this default:

```dart
class SearchText extends AppAction with Debounce {
    final int debounce = 1000; // Here!
    ...
}
```

### Advanced debounce usage

  The debounce is, by default, based on the action `runtimeType`. This means it will reset the debounce period
  when another action of the same runtimeType was is dispatched within the debounce period. In other words,
  the runtimeType is the "lock". If you want to debounce based on a different lock, you can override
  the `lockBuilder` method. For example, here we debounce two different actions based on the same lock:

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

Compatibility:

* The `Debounce` mixin should **not** be combined with `Retry` or or `UnlimitedRetryCheckInternet`.
* It should **not** be combined with other mixins that override `wrapReduce`.

## OptimisticUpdate

To provide instant feedback on actions that save information to the server, this feature immediately
applies state changes as if they were already successful, before confirming with the server.
If the server update fails, the change is rolled back and, optionally, a notification can inform
the user of the issue.

The `OptimisticUpdate` mixin is available, but it's still **experimental**. You can use it, but test it well.

Let's use a "Todo" app as an example. We want to save a new Todo to a TodoList.

This code saves the Todo, then reloads the TotoList from the cloud:

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

The problem with the above code is that it make take a second to update the todoList in the screen,
while we save then load, which is not a good user experience.

The solution is optimistically updating the TodoList before saving the new Todo to the cloud:

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

That's better. But if the saving fails, the users still have to wait for
the reload until they see the reverted state. We can further improve this:

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

Now the user sees the rollback immediately after the saving fails.

Note: If you are using a realtime database or Websockets to receive real-time updates from the
server, you may not need the finally block above, as long as the `newTodoList` above can be
told apart from the current `state.todoList`. This can be a problem if the state in question
is a primitive (boolean, number etc) or string.

The `OptimisticUpdate` mixin helps you implement the above code for you, when you provide the following:

* `newValue`: Is the new value, that you want to see saved and applied to the state.
  For example, if you want to add a new Todo to the todoList, you should return the new todoList with
  the new Todo added. You can access the fields of the action, and the state, and return the new value:
  
  ```dart
  Object? newValue() => state.todoList.add(newTodo);
  ```

* `getValueFromState`: Is a function that extract the value from the given state. Example:

  ```dart
  Object? getValueFromState(state) => state.todoList.add(newTodo);
  ```

* `applyState`: Is a function that applies the given value to the given state. Example:

  ```dart
  St applyState(state) => state.copy(todoList: newTodoList);
  ```

* `saveValue`: Is a function that saves the value to the cloud. Example:

  ```dart
  void saveValue(newTodoList) => saveTodo(todo);
  ```

* `reloadValue`: Is a function that reloads the value from the cloud. If you want to skip this step,
  simply don't provide this method. Example:

  ```dart
  Object? reloadValue() => loadTodoList();
  ```
