---
sidebar_position: 7
---

# Optimistic mixins

Suppose we have a like button.
When the user taps it, we update the UI right away and send the new like state to the server in the background.
If the user taps the button many times quickly, 
we want to combine those rapid changes into as few server calls as possible.
If the server rejects the change, we roll back the UI state.
And if the user changes the same data on another device, we need to handle server-pushed updates correctly.

Making all this work correctly is tricky, but the mixins in this section make it easy.

| Mixin                    | Purpose                                                                   |
|--------------------------|---------------------------------------------------------------------------|
| `OptimisticCommand`      | Applies state changes optimistically, rolls back on error                 |
| `OptimisticSync`         | Optimistic updates with coalescing; merges rapid dispatches into one sync |
| `OptimisticSyncWithPush` | Like `OptimisticSync` but with revision tracking for server pushes        |
| `ServerPush`             | Handles server-pushed updates for `OptimisticSyncWithPush`                |

---

## OptimisticCommand

The `OptimisticCommand` mixin is for actions that represent a command you want to run on the server
once per dispatch. It provides fast UI feedback by applying an optimistic state change immediately,
then running the command on the server, and rolling back if it fails.

Typical examples:

- Create something (add todo, create comment, send message)
- Delete something
- Submit a form
- Upload a file
- Checkout, place order, confirm payment

### When to use OptimisticSync instead

Use `OptimisticSync` or `OptimisticSyncWithPush` when the action is a **save operation**
where only the final value matters and intermediate values can be skipped:

- Like or follow toggle
- Settings switch
- Slider, checkbox
- Update a field where the last value wins

In save operations, users may tap many times quickly.
`OptimisticSync` coalesces rapid changes into minimal server calls.
`OptimisticCommand` is not built for that.

### The problem it solves

Consider a Todo app that saves a new Todo then reloads the list:

```dart
class SaveTodo extends AppAction {
  final Todo newTodo;
  SaveTodo(this.newTodo);

  Future<AppState?> reduce() async {
    await saveTodo(newTodo);
    var reloadedList = await loadTodoList();
    return state.copy(todoList: reloadedList);
  }
}
```

The problem: Users wait while we save then reload.
The solution: Apply the change optimistically first, then sync with the server.

### How to use

You must provide these methods:

| Method                            | Description                                             |
|-----------------------------------|---------------------------------------------------------|
| `optimisticValue()`               | Returns the value to apply optimistically               |
| `getValueFromState(state)`        | Extracts the current value from a given state           |
| `applyValueToState(state, value)` | Applies a value to the state and returns the new state  |
| `sendCommandToServer(value)`      | Runs the server command                                 |
| `reloadFromServer()`              | Optionally reloads from server (skip by not overriding) |

### Complete example

```dart
class SaveTodo extends AppAction with OptimisticCommand {
  final Todo newTodo;
  SaveTodo(this.newTodo);

  // The optimistic value to apply right away.
  Object? optimisticValue() => newTodo;

  // How to read the value from state.
  Object? getValueFromState(AppState state)
    => state.todoList.getById(newTodo.id);

  // How to apply a value to state.
  AppState applyValueToState(AppState state, Object? value)
    => state.copy(todoList: state.todoList.add(value as Todo));

  // Send the command to server.
  Future<Object?> sendCommandToServer(Object? value) async
    => await saveTodo(newTodo);

  // Optionally reload on error.
  Future<Object?> reloadFromServer() async
    => await loadTodoList();
}
```

### Non-reentrant behavior

`OptimisticCommand` is always non-reentrant.
If the same action is dispatched while running, the new dispatch is aborted.

Check if the action is in progress to show UI feedback:

```dart
bool isSaving = context.isWaiting(SaveTodo);
```

Override `nonReentrantKeyParams` to allow concurrent dispatches for different parameters:

```dart
class SaveTodo extends AppAction with OptimisticCommand {
  final String itemId;
  SaveTodo(this.itemId);

  Object? nonReentrantKeyParams() => itemId;
  ...
}
```

Now `SaveTodo('A')` and `SaveTodo('B')` can run concurrently,
but two `SaveTodo('A')` cannot.

### Combining with Retry

When combined with `Retry`, only the `sendCommandToServer` call is retried,
not the optimistic update or rollback. This prevents UI flickering.
The optimistic state remains in place during retries.

### Combining with CheckInternet

When combined with `CheckInternet` or `AbortWhenNoInternet`, if offline:

- No optimistic state is applied
- No server call is attempted
- The action fails with dialog (for `CheckInternet`)

### Rollback behavior

If `sendCommandToServer` fails, the mixin rolls back only if the current state
still matches the optimistic value. This avoids undoing newer changes made while
the request was in flight.

You can manually control rollback by overriding:

- `shouldRollback()` - whether to rollback
- `rollbackState()` - what state to restore

---

## OptimisticSync

The `OptimisticSync` mixin is for actions where user interactions (like toggling a "like" button)
should update the UI immediately and sync with the server, ensuring eventual consistency.

Every dispatch applies an optimistic update immediately, giving instant feedback.
However, only one server request runs at a time per key.
Changes made while a request is in flight are coalesced into a follow-up request.

Typical examples:

- Like or follow toggle
- Settings switch
- Slider, checkbox
- Any field where the last value wins

### How it works

```
State: liked = false (server confirmed)

User taps LIKE:
  → State: liked = true (optimistic)
  → Request 1 sends: setLiked(true)

User taps UNLIKE (Request 1 still in flight):
  → State: liked = false (optimistic)
  → No request sent (locked)

User taps LIKE (Request 1 still in flight):
  → State: liked = true (optimistic)
  → No request sent (locked)

Request 1 completes:
  → Sent value was `true`, current state is `true`
  → They match, no follow-up needed
```

If the state had been `false` when Request 1 completed,
a follow-up request would automatically be sent with `false`.

### How to use

You must provide these methods:

| Method                                        | Description                                 |
|-----------------------------------------------|---------------------------------------------|
| `valueToApply()`                              | Returns the value to apply optimistically   |
| `applyOptimisticValueToState(state, value)`   | Applies the optimistic value to the state   |
| `getValueFromState(state)`                    | Extracts the current value from state       |
| `sendValueToServer(value)`                    | Sends the value to the server               |
| `applyServerResponseToState(state, response)` | Applies server response to state (optional) |
| `onFinish(error)`                             | Called when sync completes (optional)       |

### Complete example

```dart
class ToggleLike extends AppAction with OptimisticSync<AppState, bool> {
  final String itemId;
  ToggleLike(this.itemId);

  // Different items can sync concurrently.
  Object? optimisticSyncKeyParams() => itemId;

  // Toggle the current state.
  bool valueToApply() => !state.items[itemId].liked;

  // Apply the optimistic value.
  AppState applyOptimisticValueToState(AppState state, bool isLiked)
    => state.copy(items: state.items.setLiked(itemId, isLiked));

  // Read value to detect if follow-up is needed.
  bool getValueFromState(AppState state) => state.items[itemId].liked;

  // Send to server.
  Future<Object?> sendValueToServer(Object? value) async
    => await api.setLiked(itemId, value);

  // Apply server response (optional).
  AppState? applyServerResponseToState(AppState state, Object serverResponse)
    => state.copy(items: state.items.setLiked(itemId, serverResponse as bool));

  // Handle completion (optional).
  Future<AppState?> onFinish(Object? error) async {
    if (error != null) {
      // Reload from server on error.
      var reloaded = await api.getItem(itemId);
      return state.copy(items: state.items.update(itemId, reloaded));
    }
    return null;
  }
}
```

### Using parameters to separate keys

By default, coalescing is based on the action's `runtimeType`.
Override `optimisticSyncKeyParams` to allow concurrent requests for different items:

```dart
Object? optimisticSyncKeyParams() => itemId;
```

Now `ToggleLike('A')` and `ToggleLike('B')` can have concurrent requests.

### Server response handling

If `sendValueToServer` returns a non-null value, it is applied to the state
**only when the state stabilizes** (no pending follow-up requests).
This prevents overwriting subsequent user interactions.

### Error handling with onFinish

When the sync completes (success or failure), `onFinish` is called.
Use it to reload data or rollback on error:

```dart
Future<AppState?> onFinish(Object? error) async {
  if (error != null) {
    // Rollback only if state still has our optimistic value.
    if (getValueFromState(state) == optimisticValue) {
      return applyOptimisticValueToState(state, getValueFromState(initialState));
    }
  }
  return null;
}
```

The mixin provides these fields for rollback logic:

- `optimisticValue` - The value from `valueToApply()` for this dispatch
- `lastSentValue` - The most recent value sent to the server

### Difference from other mixins

| Mixin               | Behavior                                                        |
|---------------------|-----------------------------------------------------------------|
| `Debounce`          | Waits for inactivity before sending *any* request               |
| `NonReentrant`      | Aborts subsequent dispatches entirely                           |
| `OptimisticCommand` | Has rollback logic; not designed for rapid toggling             |
| `OptimisticSync`    | Immediate feedback; coalesces changes; only final state matters |

---

## OptimisticSyncWithPush and ServerPush

These two mixins work together to handle optimistic updates when your app receives
**server-pushed updates** (WebSockets, Server-Sent Events, Firebase, etc.)
that may modify the same state your action controls.

**Use `OptimisticSyncWithPush`** for the action that sends user intent to the server.
**Use `ServerPush`** for the action that applies server-pushed updates to the state.

If your app does **not** receive server-pushed updates, use `OptimisticSync` instead.

### When to use

Use these mixins when:

- Your app receives real-time updates from the server
- Multiple devices can modify the same data
- You need "last write wins" semantics across devices
- Updates may arrive out of order

### How it differs from OptimisticSync

`OptimisticSyncWithPush` extends `OptimisticSync` with revision tracking:

- Each local dispatch increments a `localRevision` counter
- Server-pushed updates do NOT increment `localRevision`
- Follow-up logic compares revisions instead of just values
- This prevents push updates from incorrectly marking state as "stable"

### OptimisticSyncWithPush example

```dart
class ToggleLike extends AppAction with OptimisticSyncWithPush<AppState, bool> {
  final String itemId;
  ToggleLike(this.itemId);

  Object? optimisticSyncKeyParams() => itemId;

  bool valueToApply() => !state.items[itemId].liked;

  AppState applyOptimisticValueToState(AppState state, bool isLiked)
    => state.copy(items: state.items.setLiked(itemId, isLiked));

  bool getValueFromState(AppState state) => state.items[itemId].liked;

  // IMPORTANT: Must read the server revision from state for this key.
  int? getServerRevisionFromState(Object? key)
    => state.items[key as String].serverRevision;

  AppState? applyServerResponseToState(AppState state, Object serverResponse)
    => state.copy(items: state.items.setLiked(itemId, serverResponse as bool));

  Future<Object?> sendValueToServer(Object? value) async {
    // Get local revision BEFORE any await.
    int localRev = localRevision();

    var response = await api.setLiked(itemId, value, localRev: localRev);

    // Inform the server revision from the response.
    informServerRevision(response.serverRev);

    return response.liked;
  }
}
```

### Key methods for revision tracking

| Method                            | Description                                             |
|-----------------------------------|---------------------------------------------------------|
| `localRevision()`                 | Call in `sendValueToServer` to get the revision to send |
| `informServerRevision(rev)`       | Call after receiving server response                    |
| `getServerRevisionFromState(key)` | Override to read server revision from state             |

**Important:** Call `localRevision()` BEFORE any `await` in `sendValueToServer`.

### ServerPush example

Use `ServerPush` for the action that handles incoming server updates:

```dart
class PushLikeUpdate extends AppAction with ServerPush<AppState> {
  final String itemId;
  final bool liked;
  final int serverRev;

  PushLikeUpdate({
    required this.itemId,
    required this.liked,
    required this.serverRev,
  });

  // Link to the OptimisticSyncWithPush action type.
  Type associatedAction() => ToggleLike;

  // Same key params as the associated action.
  Object? optimisticSyncKeyParams() => itemId;

  // The revision from the server push.
  int serverRevision() => serverRev;

  // Read server revision from state for this key.
  int? getServerRevisionFromState(Object? key)
    => state.items[key as String].serverRevision;

  // Apply the push and save the server revision.
  AppState? applyServerPushToState(AppState state, Object? key, int serverRevision)
    => state.copy(
         items: state.items.update(
           key as String,
           (item) => item.copy(liked: liked, serverRevision: serverRevision),
         ),
       );
}
```

### How revisions work together

```
Local dispatch (ToggleLike):
  → localRevision() returns 1
  → Sends request with localRev=1
  → Server responds with serverRev=100
  → informServerRevision(100) records this

Server push arrives (PushLikeUpdate):
  → serverRevision() returns 99 (older than 100)
  → Push is ignored as stale

Server push arrives (PushLikeUpdate):
  → serverRevision() returns 101 (newer than 100)
  → Push is applied to state
  → Supersedes local intent if no newer local dispatch
```

### Stale push protection

`ServerPush` automatically ignores out-of-order or stale pushes:

- If incoming `serverRevision` ≤ current known revision, the push is ignored
- This prevents older server states from overwriting newer ones

### Persisting server revision

You must save the server revision in your state and implement `getServerRevisionFromState`
in both mixins. This ensures revision tracking survives app restarts:

```dart
class Item {
  final bool liked;
  final int? serverRevision; // Persist this!

  Item({required this.liked, this.serverRevision});
}
```

