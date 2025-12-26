---
sidebar_position: 6
---

# Control mixins

The mixins explained in this page help you control when and how actions run.
They let you prevent duplicate work, retry on failure, limit how often actions execute, 
and skip work when data is already up to date.

| Mixin                         | Purpose                                                                   | Overrides                     |
|-------------------------------|---------------------------------------------------------------------------|-------------------------------|
| `NonReentrant`                | Aborts if the same action is already running                              | `abortDispatch`               |
| `Retry`                       | Retries the action on error with exponential backoff                      | `wrapReduce`                  |
| `UnlimitedRetries`            | Modifier for `Retry` to retry indefinitely                                | (requires `Retry`)            |
| `Throttle`                    | Limits action execution to at most once per throttle period               | `abortDispatch`, `after`      |
| `Debounce`                    | Delays execution until after a period of inactivity                       | `wrapReduce`                  |
| `Fresh`                       | Skips action if data is still fresh (not stale)                           | `abortDispatch`, `after`      |

---

## NonReentrant

The `NonReentrant` mixin prevents an action from running if another instance of the same action
is already running. The new dispatch is silently aborted.

```dart
class SaveAction extends AppAction with NonReentrant {
  Future<AppState?> reduce() async {
    await http.put('http://myapi.com/save', body: 'data');
    return null;
  }
}
```

### Using parameters to differentiate actions

By default, the non-reentrant check is based on the action's `runtimeType`.
This means two instances of the same action class cannot run at the same time.

If you want instances with different parameters to run in parallel,
override `nonReentrantKeyParams()`:

```dart
class SaveItem extends AppAction with NonReentrant {
  final String itemId;
  SaveItem(this.itemId);

  Object? nonReentrantKeyParams() => itemId;
  ...
}
```

With this setup, `SaveItem('A')` and `SaveItem('B')` can run in parallel,
but two `SaveItem('A')` dispatched at the same time will not both run.

### Sharing a key across action types

If you want different action types to block each other,
override `computeNonReentrantKey()` to return the same key:

```dart
class SaveUser extends AppAction with NonReentrant {
  final String orderId;
  SaveUser(this.orderId);

  Object? computeNonReentrantKey() => orderId;
  ...
}

class DeleteUser extends AppAction with NonReentrant {
  final String orderId;
  DeleteUser(this.orderId);

  Object? computeNonReentrantKey() => orderId;
  ...
}
```

With this setup, `SaveUser('123')` and `DeleteUser('123')` cannot run at the same time
because they share the same key.

---

## Retry

The `Retry` mixin retries the `reduce` method with exponential backoff when it throws an error.
If the `before` method throws, retries do **not** happen.

```dart
class LoadText extends AppAction with Retry {
  Future<AppState?> reduce() async {
    var response = await http.get('https://example.com/data');
    return state.copy(data: response.body);
  }
}
```

### Parameters

You can override these parameters to customize retry behavior:

| Parameter      | Default | Description                                           |
|----------------|---------|-------------------------------------------------------|
| `initialDelay` | 350 ms  | Delay before the first retry                          |
| `multiplier`   | 2       | Factor by which delay increases each retry            |
| `maxRetries`   | 3       | Maximum retry attempts (total tries = maxRetries + 1) |
| `maxDelay`     | 5 sec   | Maximum delay to prevent excessively long waits       |

With the defaults, delays are: 350 ms, 700 ms, 1.4 sec.

**Note:** Retry delays start after the reducer finishes.
If `reduce()` takes 1 second to fail and `initialDelay` is 350 ms,
the first retry starts 1.35 seconds after the action began.

### Tracking retry attempts

Use the `attempts` getter to check the current retry count:

```dart
class LoadText extends AppAction with Retry {
  Future<AppState?> reduce() async {
    print('Attempt number: $attempts');
    ...
  }
}
```

### Unlimited retries

Add `UnlimitedRetries` to retry indefinitely until success:

```dart
class MyAction extends AppAction with Retry, UnlimitedRetries { ... }
```

This is equivalent to setting `maxRetries` to `-1`.

**Warning:** If you use `await dispatchAndWait(action)` with `UnlimitedRetries`,
it may never complete if the action keeps failing.

### Combining with NonReentrant

For most actions using `Retry`, also add `NonReentrant` to prevent
multiple instances from running simultaneously:

```dart
class MyAction extends AppAction with Retry, NonReentrant { ... }
```

**Note:** All actions using `Retry` become asynchronous, even if originally synchronous.

---

## Throttle

The `Throttle` mixin limits how often an action can run.
If an action is dispatched multiple times within the throttle period,
only the first dispatch runs and the rest are silently aborted.
After the period passes, the next dispatch is allowed to run again.

This is useful when an action may be triggered many times in quick succession
(e.g., by fast user input or widget rebuilds) but should only run occasionally.

```dart
class LoadInformation extends AppAction with Throttle {
  int get throttle => 5000; // 5 seconds

  Future<AppState?> reduce() async {
    var information = await loadInformation();
    return state.copy(information: information);
  }
}
```

The `throttle` value is in milliseconds. The default is `1000` (1 second).

### Bypassing the throttle

Override `ignoreThrottle` to selectively bypass the throttle:

```dart
class MyAction extends AppAction with Throttle {
  final bool force;
  MyAction({this.force = false});

  bool get ignoreThrottle => force;
  ...
}
```

Now dispatching `MyAction(force: true)` will always run, regardless of the throttle period.

### Behavior on failure

By default, if the action fails, the throttle lock remains in place.
The action will not run again if dispatched within the throttle period.

To allow immediate retry after failure, set `removeLockOnError` to `true`:

```dart
class MyAction extends AppAction with Throttle {
  bool get removeLockOnError => true;
  ...
}
```

You can also manually remove the lock by calling `removeLock()`,
or clear all throttle locks with `removeAllLocks()`.

### Custom lock

By default, throttling is based on the action's `runtimeType`.
Override `lockBuilder` to use a different lock.

Two actions sharing the same lock:

```dart
class MyAction1 extends AppAction with Throttle {
  Object? lockBuilder() => 'sharedLock';
  ...
}

class MyAction2 extends AppAction with Throttle {
  Object? lockBuilder() => 'sharedLock';
  ...
}
```

Throttle based on an action parameter:

```dart
class LoadItem extends AppAction with Throttle {
  final String itemId;
  LoadItem(this.itemId);

  Object? lockBuilder() => itemId;
  ...
}
```

With this setup, `LoadItem('A')` and `LoadItem('B')` have independent throttle periods.

---

## Debounce

The `Debounce` mixin delays execution until the action stops being dispatched
for a specified period. Each new dispatch resets the wait time.

This is useful when you want to wait for "quiet time" before running,
such as validating input only after the user stops typing.

```dart
class SearchText extends AppAction with Debounce {
  final String searchTerm;
  SearchText(this.searchTerm);

  Future<AppState?> reduce() async {
    var response = await http.get(
      Uri.parse('https://example.com/?q=${Uri.encodeComponent(searchTerm)}')
    );
    return state.copy(searchResult: response.body);
  }
}
```

The `debounce` value is in milliseconds. The default is `333` (1/3 second).

```dart
class SearchText extends AppAction with Debounce {
  int get debounce => 1000; // 1 second
  ...
}
```

### Difference from Throttle

- **Throttle**: Runs immediately on first dispatch, then blocks for the period
- **Debounce**: Waits for quiet time, only runs after dispatches stop

### Custom lock

By default, debouncing is based on the action's `runtimeType`.
Override `lockBuilder` to use a different lock.

Two actions sharing the same lock:

```dart
class MyAction1 extends AppAction with Debounce {
  Object? lockBuilder() => 'sharedLock';
  ...
}

class MyAction2 extends AppAction with Debounce {
  Object? lockBuilder() => 'sharedLock';
  ...
}
```

Debounce based on an action parameter:

```dart
class SearchField extends AppAction with Debounce {
  final String fieldId;
  SearchField(this.fieldId);

  Object? lockBuilder() => fieldId;
  ...
}
```

---

## Fresh

The `Fresh` mixin prevents an action from running while its data is still considered "fresh".
After the fresh period ends, the data becomes "stale" and the next dispatch runs again.

This helps avoid reloading the same information too often.

```dart
class LoadInformation extends AppAction with Fresh {
  int get freshFor => 5000; // Fresh for 5 seconds

  Future<AppState?> reduce() async {
    var information = await loadInformation();
    return state.copy(information: information);
  }
}
```

The `freshFor` value is in milliseconds. The default is `1000` (1 second).

### Using parameters to separate fresh periods

By default, freshness is based on the action's `runtimeType`.
All instances of the same action class share one fresh period.

Override `freshKeyParams` when different instances need separate fresh periods:

```dart
class LoadUserCart extends AppAction with Fresh {
  final String userId;
  LoadUserCart(this.userId);

  Object? freshKeyParams() => userId;
  ...
}
```

With this setup:

- `LoadUserCart('A')` and `LoadUserCart('B')` have independent fresh periods
- Two `LoadUserCart('A')` dispatched quickly will only run the first one

You can return multiple fields using a tuple:

```dart
Object? freshKeyParams() => (userId, cartId);
```

### Forcing the action to run

Override `ignoreFresh` to bypass the fresh check:

```dart
class LoadInformation extends AppAction with Fresh {
  final bool force;
  LoadInformation({this.force = false});

  bool get ignoreFresh => force;
  ...
}
```

Now `LoadInformation(force: true)` always runs and starts a new fresh period.

### Behavior on failure

If an action fails, the mixin does not extend the fresh period.
The key is restored to its previous state, so you can retry immediately.

You can also manually control freshness:

- Call `removeKey()` to make the current action's key stale
- Call `removeAllKeys()` to make all keys stale (useful during logout)

### Sharing a key across action types

Override `computeFreshKey` to make different action types share the same fresh period:

```dart
class LoadUserProfile extends AppAction with Fresh {
  final String userId;
  LoadUserProfile(this.userId);

  Object computeFreshKey() => userId;
  ...
}

class LoadUserSettings extends AppAction with Fresh {
  final String userId;
  LoadUserSettings(this.userId);

  Object computeFreshKey() => userId;
  ...
}
```

Here, `LoadUserProfile('123')` and `LoadUserSettings('123')` share one fresh period
because they return the same key.



