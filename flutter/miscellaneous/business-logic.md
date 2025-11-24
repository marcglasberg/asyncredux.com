---
sidebar_position: 21
---

# Where to put the business logic?

## Business Layer

These are part of the business layer:

* State classes
* Actions and their reducers
* Action selectors

## UI Layer

These are part of the UI layer:

* Widgets
* `StoreConnector`, `ViewModel` and `Factory`
* Context extensions
* Widget selectors

## Where to put your business logic?

* Recommended: Put your business logic in your **state classes**.
* Action selectors can also contain business logic.
* You can also put business logic in your **actions**, but that's **not the best place**.

However:

* Don't put your business logic in widgets
* Don't put your business logic in the `StoreConnector`, `ViewModel` or `Factory`
