---
sidebar_position: 5
---

# Internet mixins

The mixins explained in this page help us check for internet connectivity
before running an action.

| Mixin                         | Purpose                                                                   | Overrides                     |
|-------------------------------|---------------------------------------------------------------------------|-------------------------------|
| `CheckInternet`               | Checks internet before action; shows dialog if no connection              | `before`                      |
| `NoDialog`                    | Modifier for `CheckInternet` to suppress dialog                           | (requires `CheckInternet`)    |
| `AbortWhenNoInternet`         | Checks internet before action; aborts silently if no connection           | `before`                      |
| `UnlimitedRetryCheckInternet` | Combines internet check + unlimited retry + non-reentrant                 | `abortDispatch`, `wrapReduce` |

---

## CheckInternet

The `CheckInternet` mixin checks for internet connectivity before running the action.
If there is no internet, the action aborts and a dialog opens with the message
_"There is no Internet. Please, verify your connection."_

```dart
class LoadText extends AppAction with CheckInternet {
  Future<String> reduce() async {
    var response = await http.get('https://dummyjson.com/todos/1');
    ...
  }
}
```

You can display information in your widgets when the action fails due to no connection:

```dart
if (context.isFailed(LoadText)) Text('No Internet connection');
```

Or use the exception text:

```dart
var errorText = context.exceptionFor(LoadText)?.errorText ?? 'No Internet';
if (context.isFailed(LoadText)) Text(errorText);
```

### Customizing the error

To customize the dialog message or `errorText`,
override `connectionException()` and return a custom `UserException`:

```dart
class LoadText extends AppAction with CheckInternet {

  UserException connectionException(List<ConnectivityResult> result) {
    return UserException('Custom error message');
  }
  ...
}
```

## NoDialog

The `NoDialog` mixin can only be used together with `CheckInternet`.
It prevents the error dialog from opening, while still aborting the action.
This is useful when you just want to handle connectivity errors in your widgets instead of showing a dialog:

```dart
class LoadText extends AppAction with CheckInternet, NoDialog {
  ...
}

// Then, in your widget:
Widget build(context) {
  if (context.isFailed(LoadText)) {
    var message = context.exceptionFor(LoadText)?.errorText ?? 'No connection';
    return Text(message);
  }
  ...
}
```

**Note:** `CheckInternet` and `NoDialog` only check if the device's internet is on or off.
They do not verify if the internet provider is working or if the server is available.
The check may pass, but network requests can still fail.

## UnlimitedRetryCheckInternet

The `UnlimitedRetryCheckInternet` mixin retries the action indefinitely until it succeeds.
It checks for internet connectivity before each attempt and waits if there is no connection.
It also retries if there is internet but the action fails for other reasons.

This is useful for critical actions that must eventually succeed,
such as loading essential data when your app opens.

```dart
class LoadInitialData extends AppAction with UnlimitedRetryCheckInternet {
  Future<AppState?> reduce() async {
    var response = await http.get('http://myapp.com/initialData');
    return state.copy(data: response.body);
  }
}
```

This mixin automatically makes the action non-reentrant,
so dispatching the same action while it's running will be ignored.

### Parameters

You can override these parameters to customize retry behavior:

| Parameter            | Default | Description                                              |
|----------------------|---------|----------------------------------------------------------|
| `initialDelay`       | 350 ms  | Delay before the first retry                             |
| `multiplier`         | 2       | Factor by which delay increases each retry               |
| `maxDelay`           | 5 sec   | Maximum delay when retrying after errors (with internet) |
| `maxDelayNoInternet` | 1 sec   | Maximum delay when waiting for internet                  |

The shorter `maxDelayNoInternet` allows faster recovery when connectivity returns.

### Tracking retry attempts

Use the `attempts` getter to check the current retry count:

```dart
class LoadInitialData extends AppAction with UnlimitedRetryCheckInternet {
  Future<AppState?> reduce() async {
    print('Attempt number: $attempts');
    ...
  }
}
```

### Logging retries

All retries are printed to the console by default.
To disable or customize logging, override `printRetries()`:

```dart
class LoadInitialData extends AppAction with UnlimitedRetryCheckInternet {
  void printRetries(String message) {} // Disable logging
  ...
}
```

**Note:** If your `before` method throws an error, retries will **not** happen.

**Note:** This mixin only checks if the device's internet is on or off.
It does not verify if the internet provider is working or if the server is available.
The check may pass, but network requests can still fail.

## AbortWhenNoInternet

The `AbortWhenNoInternet` mixin checks for internet connectivity before running the action.
If there is no internet, the action aborts silently, as if it had never been dispatched.
No errors are thrown and no dialogs are shown.

```dart
class LoadText extends AppAction with AbortWhenNoInternet {
  Future<String> reduce() async {
    var response = await http.get('http://numbersapi.com/42');
    return response.body;
  }
}
```

**Note:** This mixin only checks if the device's internet is on or off.
It does not verify if the internet provider is working or if the server is available.
The check may pass, but network requests can still fail.

## Simulating connectivity in tests

During tests, you can simulate the internet being on or off.

**Option 1:** Override `internetOnOffSimulation` in the action:

```dart
class LoadText extends AppAction with CheckInternet {
  bool? get internetOnOffSimulation => false; // Simulates NO internet
  ...
}
```

Return `true` to simulate having internet, `false` to simulate no internet,
or `null` to use the real connectivity status.

**Option 2:** Set `forceInternetOnOffSimulation` on the store to affect all actions:

```dart
store.forceInternetOnOffSimulation = () => false; // Simulates NO internet for all actions
```

This applies to all actions using `CheckInternet`, `AbortWhenNoInternet`,
or `UnlimitedRetryCheckInternet`.
Since it's tied to the store, it resets automatically when the store is recreated.


