---
sidebar_position: 4
---

# Action mixins

You can add **mixins** to your actions to handle common tasks.
For example, instead of writing:

```dart
class LoadText extends AppAction { ...
```

You can add `with CheckInternet` to check for internet connectivity:

```dart
class LoadText extends AppAction with CheckInternet { ...
```

Or even combine multiple mixins:

```dart
class LoadText extends AppAction with CheckInternet, NonReentrant, Retry { ...
```

## All available mixins

| Mixin                                            | Purpose                                                                   | Overrides                     |
|--------------------------------------------------|---------------------------------------------------------------------------|-------------------------------|
| [CheckInternet](./internet-mixins)               | Checks internet before action; shows dialog if no connection              | `before`                      |
| [NoDialog](./internet-mixins)                    | Modifier for `CheckInternet` to suppress dialog                           | (requires `CheckInternet`)    |
| [AbortWhenNoInternet](./internet-mixins)         | Checks internet before action; aborts silently if no connection           | `before`                      |
| [NonReentrant](./control-mixins)                 | Aborts if the same action is already running                              | `abortDispatch`               |
| [Retry](./control-mixins)                        | Retries the action on error with exponential backoff                      | `wrapReduce`                  |
| [UnlimitedRetries](./control-mixins)             | Modifier for `Retry` to retry indefinitely                                | (requires `Retry`)            |
| [UnlimitedRetryCheckInternet](./internet-mixins) | Combines internet check + unlimited retry + non-reentrant                 | `abortDispatch`, `wrapReduce` |
| [Throttle](./control-mixins)                     | Limits action execution to at most once per throttle period               | `abortDispatch`, `after`      |
| [Debounce](./control-mixins)                     | Delays execution until after a period of inactivity                       | `wrapReduce`                  |
| [Fresh](./control-mixins)                        | Skips action if data is still fresh (not stale)                           | `abortDispatch`, `after`      |
| [OptimisticCommand](./optimistic-mixins)         | Applies state changes optimistically, rolls back on error                 | `reduce`                      |
| [OptimisticSync](./optimistic-mixins)            | Optimistic updates with coalescing; merges rapid dispatches into one sync | `reduce`                      |
| [OptimisticSyncWithPush](./optimistic-mixins)    | Like `OptimisticSync` but with revision tracking for server pushes        | `reduce`                      |
| [ServerPush](./optimistic-mixins)                | Handles server-pushed updates for `OptimisticSyncWithPush`                | `reduce`                      |

## Compatibility matrix

Not all mixins can be combined. 
AsyncRedux throws an exception if you try to use incompatible mixins together, 
and in some cases it will warn you at compile time.

|                                 | Check<br/>Internet | No<br/>Dialog | Abort<br/>When<br/>No<br/>Internet | Non<br/>Reentrant | Retry | Unlimited<br/>Retries | Unlimited<br/>Retry<br/>Check<br/>Internet | Throttle | Debounce | Fresh | Optimistic<br/>Command | Optimistic<br/>Sync | Optimistic<br/>Sync<br/>WithPush | Server<br/>Push |
|---------------------------------|:------------------:|:-------------:|:----------------------------------:|:-----------------:|:-----:|:---------------------:|:------------------------------------------:|:--------:|:--------:|:-----:|:----------------------:|:-------------------:|:--------------------------------:|:---------------:|
| **CheckInternet**               |         —          |       ✅       |                 ❌                  |         ✅         |  ✅️   |          ✅️           |                     ❌                      |    ✅     |    ✅     |   ✅   |           ✅            |          ✅          |                ✅                 |        ❌        |
| **NoDialog**                    |         ➡️         |       —       |                 ❌                  |         ✅         |  ✅️   |          ✅️           |                     ❌                      |    ✅     |    ✅     |   ✅   |           ✅            |          ✅          |                ✅                 |        ❌        |
| **AbortWhenNoInternet**         |         ❌          |       ❌       |                 —                  |         ✅         |  ✅️   |          ✅️           |                     ❌                      |    ✅     |    ✅     |   ✅   |           ✅            |          ✅          |                ✅                 |        ❌        |
| **NonReentrant**                |         ✅          |       ✅       |                 ✅                  |         —         |   ✅   |           ✅           |                     ❌                      |    ❌     |    ✅     |   ❌   |           ❌            |          ❌          |                ❌                 |        ❌        |
| **Retry**                       |         ✅️         |      ✅️       |                 ✅️                 |         ✅         |   —   |           ✅           |                     ❌                      |    ✅     |    ❌     |   ✅   |           ✅            |          ❌          |                ❌                 |        ❌        |
| **UnlimitedRetries**            |         ✅️         |      ✅️       |                 ✅️                 |         ✅         |  ➡️   |           —           |                     ❌                      |    ✅     |    ❌     |   ✅   |           ❌            |          ❌          |                ❌                 |        ❌        |
| **UnlimitedRetryCheckInternet** |         ❌          |       ❌       |                 ❌                  |         ❌         |   ❌   |           ❌           |                     —                      |    ❌     |    ❌     |   ❌   |           ❌            |          ❌          |                ❌                 |        ❌        |
| **Throttle**                    |         ✅          |       ✅       |                 ✅                  |         ❌         |   ✅   |           ✅           |                     ❌                      |    —     |    ✅     |   ❌   |           ❌            |          ❌          |                ❌                 |        ❌        |
| **Debounce**                    |         ✅          |       ✅       |                 ✅                  |         ✅         |   ❌   |           ❌           |                     ❌                      |    ✅     |    —     |   ✅   |           ❌            |          ❌          |                ❌                 |        ❌        |
| **Fresh**                       |         ✅          |       ✅       |                 ✅                  |         ❌         |   ✅   |           ✅           |                     ❌                      |    ❌     |    ✅     |   —   |           ❌            |          ❌          |                ❌                 |        ❌        |
| **OptimisticCommand**           |         ✅          |       ✅       |                 ✅                  |         ❌         |   ✅   |           ❌           |                     ❌                      |    ❌     |    ❌     |   ❌   |           —            |          ❌          |                ❌                 |        ❌        |
| **OptimisticSync**              |         ✅          |       ✅       |                 ✅                  |         ❌         |   ❌   |           ❌           |                     ❌                      |    ❌     |    ❌     |   ❌   |           ❌            |          —          |                ❌                 |        ❌        |
| **OptimisticSyncWithPush**      |         ✅          |       ✅       |                 ✅                  |         ❌         |   ❌   |           ❌           |                     ❌                      |    ❌     |    ❌     |   ❌   |           ❌            |          ❌          |                —                 |        ❌        |
| **ServerPush**                  |         ❌          |       ❌       |                 ❌                  |         ❌         |   ❌   |           ❌           |                     ❌                      |    ❌     |    ❌     |   ❌   |           ❌            |          ❌          |                ❌                 |        —        |

#### ✅ Compatible (can be combined)

#### ❌ Incompatible (cannot be combined)

#### ➡️ Requires (must be used together)

<hr></hr>

All mixins will be explained in detail in the following pages:

* [Internet mixins](./internet-mixins)
* [Control mixins](./control-mixins)
* [Optimistic mixins](./optimistic-mixins)

