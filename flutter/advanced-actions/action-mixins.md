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

| Mixin                                               | Purpose                                                                   | Overrides                     |
|-----------------------------------------------------|---------------------------------------------------------------------------|-------------------------------|
| [CheckInternet](./internet-mixins.md)               | Checks internet before action; shows dialog if no connection              | `before`                      |
| [NoDialog](/.internet-mixins.md)                    | Modifier for `CheckInternet` to suppress dialog                           | (requires `CheckInternet`)    |
| [AbortWhenNoInternet](/.internet-mixins.md)         | Checks internet before action; aborts silently if no connection           | `before`                      |
| [NonReentrant](/.control-mixins.md)                 | Aborts if the same action is already running                              | `abortDispatch`               |
| [Retry](/.control-mixins.md)                        | Retries the action on error with exponential backoff                      | `wrapReduce`                  |
| [UnlimitedRetries](/.control-mixins.md)             | Modifier for `Retry` to retry indefinitely                                | (requires `Retry`)            |
| [UnlimitedRetryCheckInternet](/.internet-mixins.md) | Combines internet check + unlimited retry + non-reentrant                 | `abortDispatch`, `wrapReduce` |
| [Throttle](/.control-mixins.md)                     | Limits action execution to at most once per throttle period               | `abortDispatch`, `after`      |
| [Debounce](/.control-mixins.md)                     | Delays execution until after a period of inactivity                       | `wrapReduce`                  |
| [Fresh](/.control-mixins.md)                        | Skips action if data is still fresh (not stale)                           | `abortDispatch`, `after`      |
| [OptimisticCommand](/.optimistic-mixins.md)         | Applies state changes optimistically, rolls back on error                 | `reduce`                      |
| [OptimisticSync](/.optimistic-mixins.md)            | Optimistic updates with coalescing; merges rapid dispatches into one sync | `reduce`                      |
| [OptimisticSyncWithPush](/.optimistic-mixins.md)    | Like `OptimisticSync` but with revision tracking for server pushes        | `reduce`                      |
| [ServerPush](/.optimistic-mixins.md)                | Handles server-pushed updates for `OptimisticSyncWithPush`                | `reduce`                      |

## Compatibility matrix

Not all mixins can be combined. 
Async Redux throws an exception if you try to use incompatible mixins together, 
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

* [Internet mixins](./internet-mixins.md)
* [Control mixins](./control-mixins.md)
* [Optimistic mixins](./optimistic-mixins.md)

