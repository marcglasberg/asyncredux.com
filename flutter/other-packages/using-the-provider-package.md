---
sidebar_position: 1
---

# Provider 

How to use Async Redux with the Provider package?

Another good alternative to the `StoreConnector` is using
the <a href="https://pub.dev/packages/provider">Provider</a>
package.

Both the `StoreConnector` (from *async_redux*) and `ReduxSelector` (from *provider_for_redux*)
let you deal with widget rebuilds when the state changes.

You may use `StoreConnector` when you want to have two widgets, one to access the store and prepare
the state to use, and the second as a dumb widget. You may use `ReduxSelector` when you want less
boilerplate, and want to access the store directly from inside a single widget.

Please visit the <a href="https://pub.dev/packages/provider_for_redux">provider_for_redux</a>
package for in-depth explanation and examples on how to use Async Redux and Provider together.
