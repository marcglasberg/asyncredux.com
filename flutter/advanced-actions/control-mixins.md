---
sidebar_position: 6
---

# Control mixins

The mixins explained in this page help you control when and how actions run.
They let you prevent duplicate work, retry on failure, limit how often actions execute,
skip work when data is already up to date, and run actions one at a time.

| Mixin              | Purpose                                                     | Overrides                |
|--------------------|-------------------------------------------------------------|--------------------------|
| `NonReentrant`     | Aborts if the same action is already running                | `abortDispatch`          |
| `Retry`            | Retries the action on error with exponential backoff        | `wrapReduce`             |
| `UnlimitedRetries` | Modifier for `Retry` to retry indefinitely                  | (requires `Retry`)       |
| `Throttle`         | Limits action execution to at most once per throttle period | `abortDispatch`, `after` |
| `Debounce`         | Delays execution until after a period of inactivity         | `wrapReduce`             |
| `Fresh`            | Skips action if data is still fresh (not stale)             | `abortDispatch`, `after` |
| `Polling`          | Periodically dispatches an action at a fixed interval       | `wrapReduce`             |
| `Sequential`       | Runs actions one at a time, in the order they were dispatched | `before`, `after`      |

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

---

## Polling

The `Polling` mixin periodically dispatches an action at a fixed interval.
This is useful when you need to keep data fresh by fetching it from a server
at regular intervals, such as refreshing prices, checking for new messages,
or monitoring wallet balances.

```dart
class PollPrices extends AppAction with Polling {  
  PollPrices([this.poll = Poll.once]);

  ReduxAction<AppState> createPollingAction() => PollPrices();

  Future<AppState?> reduce() async {
    final prices = await api.getPrices();
    return state.copy(prices: prices);
  }
}

// Run only once 
dispatch(PollPrices());

// Start polling
dispatch(PollPrices(Poll.start));

// Stop polling
dispatch(PollPrices(Poll.stop));
```

### Poll interval

The `pollInterval` is the delay between polling ticks. The default is 10 seconds.
Override it to change the frequency:

```dart
Duration get pollInterval => const Duration(minutes: 5);
```

Note: Instead of using a periodic timer, each run schedules the next one,
so the polling interval is measured from the **end** of each run.

### Poll values

The `poll` field controls the behavior of each dispatch:

| Value                   | Behavior                                                                                                                        |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `Poll.start`            | Starts polling and runs `reduce` immediately. If polling is already active for this key, does nothing.                          |
| `Poll.stop`             | Cancels the polling for this key and skips `reduce`.                                                                            |
| `Poll.runNowAndRestart` | Runs `reduce` immediately and restarts the polling timer from that moment. If polling is not active, behaves like `Poll.start`. |
| `Poll.once`             | Runs `reduce` immediately, without affecting the polling (does not start or stop the timer).                                    |

### Option 1: Single action for everything

Use one action class that both controls polling and does the work.
The `createPollingAction` returns the same action type with `Poll.once`
(or with no poll field at all, since `Poll.once` is the default),
so timer ticks run the action without restarting the timer:

```dart
class LoadBalanceAction extends AppAction with Polling {
  final WalletAddress address;
  final Poll poll;

  LoadBalanceAction(this.address, {this.poll = Poll.once});

  Duration get pollInterval => const Duration(minutes: 5);

  ReduxAction<AppState> createPollingAction() => LoadBalanceAction(address);

  Future<AppState?> reduce() async {
    final balance = await api.getBalance(address);
    return state.copy(balance: balance);
  }
}

// Run only once
dispatch(LoadBalanceAction(address));

// Start polling
dispatch(LoadBalanceAction(address, poll: Poll.start));

// Stop polling
dispatch(LoadBalanceAction(address, poll: Poll.stop));
```

### Option 2: Separate action types

Use one action to control polling, and a different action to do the work.

```dart
class PollBalance extends AppAction with Polling {
  final WalletAddress address;
  final Poll poll;

  PollBalance(this.address, {this.poll = Poll.once});

  Duration get pollInterval => const Duration(minutes: 5);

  ReduxAction<AppState> createPollingAction() => LoadBalanceAction(address);

  Future<AppState?> reduce() async {
    await dispatchAndWait(LoadBalanceAction(address));
    return null;
  }
}

class LoadBalanceAction extends AppAction {
  final WalletAddress address;
  LoadBalanceAction(this.address);

  Future<AppState?> reduce() async {
    final balance = await api.getBalance(address);
    return state.copy(balance: balance);
  }
}

// Start polling
dispatch(PollBalance(address, poll: Poll.start));

// Stop polling
dispatch(PollBalance(address, poll: Poll.stop));
```

### Polling keys

By default, each action type gets its own independent polling timer,
keyed by its `runtimeType`. All instances of the same action type share one timer.

#### Using pollingKeyParams to separate instances

If you need separate polling timers per id, address, or some other field,
override `pollingKeyParams`. Actions of the same type but with different
`pollingKeyParams` values get independent timers.

```dart
class PollBalance extends AppAction with Polling {
  final WalletAddress address;
  final Poll poll;

  PollBalance(this.address, {this.poll = Poll.once});

  // Each address gets its own independent polling timer.
  Object? pollingKeyParams() => address;

  ReduxAction<AppState> createPollingAction() =>
      LoadBalanceAction(address);

  Future<AppState?> reduce() async {
    await dispatchAndWait(LoadBalanceAction(address));
    return null;
  }  
}

// These start two independent polling timers:
dispatch(PollBalance(address1, poll: Poll.start));
dispatch(PollBalance(address2, poll: Poll.start));

// Stop only address1:
dispatch(PollBalance(address1, poll: Poll.stop));
```

You can also return more than one field by using a tuple:

```dart
// Each (userId, walletId) pair gets its own timer.
Object? pollingKeyParams() => (userId, walletId);
```

#### Sharing a timer across action types

If you want different action types to share the same polling timer,
override `computePollingKey` and return any key you want:

```dart
class PollPrices extends AppAction with Polling {
  Object computePollingKey() => 'market-data';
  ...
}

class PollVolumes extends AppAction with Polling {
  Object computePollingKey() => 'market-data'; // same key
  ...
}
```

With this setup, starting `PollPrices` and then `PollVolumes` means
`PollVolumes` is a no-op (the key is already active). Stopping either
one cancels the shared timer.



---

## Sequential

The `Sequential` mixin makes actions run one at a time, in the exact order they were dispatched.
This is useful when each action depends on the ones dispatched before it,
or when the server must receive your changes in the right order.

```dart
class SaveItem extends AppAction with Sequential {
  final Item item;
  SaveItem(this.item);

  Future<AppState?> reduce() async {
    await http.put('http://myapi.com/items', body: item.toJson());
    return null;
  }
}
```

All actions that use this mixin share a single FIFO queue (first in, first out).
When an action is dispatched, it takes its place at the end of the queue,
and then waits until every action dispatched before it has finished.
Only then does it run its `before`, `reduce` and `after` methods.

This works across all participating action types: if `SaveItem` and `DeleteItem`
both use the mixin, they wait for each other.
Two actions of the same type also enter the queue and run one after the other.

The queue position is reserved synchronously, at the moment `dispatch` is called,
before any asynchronous gap. This guarantees the run order is the dispatch order,
even if the actions are dispatched from different places or in quick succession.

When an action finishes, the next action in the queue is released.
This happens no matter how the action finished:

- It completed successfully.
- It threw an error (from `before` or `reduce`).
- It was aborted by throwing an `AbortDispatchException` in `before`.

Note that when `abortDispatch` returns `true`, the action never enters the queue,
since none of its lifecycle methods run.

### Using parameters to separate queues

By default, all actions that use this mixin share **one** queue, whose key is `null`.
If you want independent queues, override `sequentialKeyParams` to return any object.
Actions with the same key wait for each other,
while actions with different keys run in parallel.

For example, here each user has its own queue,
so the actions of different users don't block each other:

```dart
class SaveUser extends AppAction with Sequential {
  final String userId;
  SaveUser(this.userId);

  Object? sequentialKeyParams() => userId;
  ...
}

class DeleteUser extends AppAction with Sequential {
  final String userId;
  DeleteUser(this.userId);

  Object? sequentialKeyParams() => userId;
  ...
}
```

With this setup, `SaveUser('A')` and `DeleteUser('A')` run one after the other,
but `SaveUser('A')` and `SaveUser('B')` may run at the same time.

You can also return the `runtimeType`, so that only actions of the same type
wait for each other:

```dart
Object? sequentialKeyParams() => runtimeType;
```

Keys are removed from memory as soon as their queue becomes empty.

### Discarding the queue when an action fails

Actions are often queued because each one depends on the previous ones.
For example, an action that creates an item, followed by one that updates it.
In that case, if the first action fails, running the rest makes no sense.

Override `discardQueueOnError` to return `true` when you want a failure
to abort all the actions that are waiting behind the failed one:

```dart
class SaveItem extends AppAction with Sequential {
  bool discardQueueOnError(Object error) => error is! AbortDispatchException;
  ...
}
```

The discarded actions are aborted: they don't run their `reduce` method,
and they finish with an `AbortDispatchException`
(which the store treats silently, without showing any error dialog).
You can check `wasDiscardedFromSequentialQueue` on those actions, if you need to know.

Actions dispatched after the failure are not affected, and start a fresh queue.
The default is `false`, which means the queue simply continues with the next action.

Note the error given to `discardQueueOnError` may itself be an `AbortDispatchException`,
if the action was aborted in its `before` method (for example, by `AbortWhenNoInternet`).
You may want to keep the queue in that case, as shown in the code above.

### Do not wait for an action in the same queue

An action that is running (and therefore holds the queue)
must **not** wait for another action that uses the same queue.
If it does, both actions will wait for each other forever (a deadlock):

```dart
class Parent extends AppAction with Sequential {
  Future<AppState?> reduce() async {
    // WRONG: `Child` enters the queue behind `Parent`, and waits for
    // `Parent` to finish. But `Parent` waits for `Child` here. Deadlock!
    await dispatchAndWait(Child());
    return null;
  }
}

class Child extends AppAction with Sequential { ... }
```

The same applies to any other way of waiting for a queued action, such as
`waitActionType(Child)`, `waitAllActions`, or a `waitCondition`
that only becomes true after `Child` runs.

If you need to dispatch another action of the same queue from inside a running action,
you have these options:

- Dispatch it without waiting for it: `dispatch(Child())`.
  The child is queued and will run right after the parent finishes.
- Give the child a different key, so it uses a different queue.
- Don't use the mixin in the child.

### Overriding before and after

This mixin holds the action in the `before` method until it's the action's turn to run,
and releases the queue in the `after` method.
If you override these methods, you must call `super`:

- In `before`, call `await super.before()` as the **first** statement.
  Your code after that will run when it's the action's turn.
  If you put code before `super.before()`, it will run immediately when the action is
  dispatched, which is usually not what you want.
  Never `await` anything before calling `super.before()`,
  because that would delay the queue reservation
  and the action could lose its position in the order.

- In `after`, call `super.after()`, preferably in a `finally` block,
  so the queue is released even if your own code throws.

```dart
class MyAction extends AppAction with Sequential {

  Future<void> before() async {
    await super.before(); // Waits for its turn.
    doSomething(); // Runs when it's the action's turn.
  }

  void after() {
    try {
      doSomethingElse();
    } finally {
      super.after(); // Releases the queue.
    }
  }
  ...
}
```

### Combining with other mixins

`Sequential` can be combined with `CheckInternet`, `NoDialog`, `AbortWhenNoInternet`,
`NonReentrant`, `Retry`, `UnlimitedRetries`, `Throttle`, `Fresh` and `OptimisticCommand`,
in any mixin order.
Retries happen while the action holds the queue,
and the internet check happens when the action gets its turn.
For example, `NonReentrant` plus `Sequential` means duplicates are dropped
while the original is queued or running,
and the ones that get through still run one at a time.

It cannot be combined with the mixins below,
and AsyncRedux throws an assertion error in debug mode if you try:

- `Debounce`: the debounce period would only start when the action gets its turn
  in the queue, which defeats the purpose of debouncing.

- `UnlimitedRetryCheckInternet`: it aborts the dispatch while another action of the same
  type is in progress, and an action waiting in the queue does count as in progress.
  Two actions of the same type would then never queue behind each other: the later ones
  would be silently dropped instead of being ordered,
  which is the opposite of what `Sequential` is for.
  It also retries forever while holding the queue,
  so a single action can block everything behind it for as long as the internet is down.
  To keep the ordering and still retry, use `Retry` with a limited number of attempts,
  optionally together with `discardQueueOnError`.

- `OptimisticSync`: it applies the optimistic value on dispatch,
  and coalesces overlapping dispatches into a single follow-up request.
  Both features need dispatches to overlap.
  Under `Sequential` the optimistic update would only land when the action gets its turn,
  so the UI would stop giving immediate feedback.
  And since queued actions never overlap, nothing would ever be coalesced,
  so every dispatch would send its own request.
  It already guarantees a single in-flight request per key,
  so `Sequential` adds nothing.

- `OptimisticSyncWithPush`: same reasons, plus its revision tracking assumes
  server pushes can be applied to the state while a request is in flight.

- `ServerPush`: pushed values must be applied as soon as they arrive,
  and `Sequential` would delay them behind unrelated queued actions.
  Worse, a push is what tells an in-flight `OptimisticSyncWithPush` request
  that no follow-up is needed.
  Queued behind that very request, the signal would arrive too late.

#### Combining with Polling

You can combine `Sequential` with `Polling`, but add it to the action returned by
`createPollingAction()`, and not to the action that starts and stops the polling.
Otherwise a `Poll.stop` dispatch also has to wait its turn,
and you can't stop the polling while the queue is busy.

Also, if a tick can take longer than `pollInterval`,
add `NonReentrant` or `Throttle` to the tick action, so that ticks don't pile up
in the queue.

### Other notes

- Actions using this mixin are always asynchronous, even if their `reduce` method is
  synchronous. This means you can't use `dispatchSync` with them.

- While an action is waiting in the queue, it counts as being "in progress",
  so `isWaiting(MyAction)` returns `true` for it.
  This is usually what you want, as it lets you show a spinner
  as soon as the action is dispatched.
  You can also check `isWaitingInSequentialQueue` on the action itself.
