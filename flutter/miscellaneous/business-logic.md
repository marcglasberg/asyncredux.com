---
sidebar_position: 21
---

# Where to put business logic?

## Business Layer

These are part of the business layer:

* State classes
* Actions and their reducers
* Action selectors

## UI Layer

These are part of the UI layer:

* Widgets
* Context extensions
* Widget selectors
* `StoreConnector`, `ViewModel` and `Factory`

## Where to put your business logic?

* Recommended: Put your business logic in your **state classes**.
* You can also put business logic in your **actions**, but that's **not the best place**.

However:

* Don't put your business logic in widgets
* Don't put your business logic in the `StoreConnector`, `ViewModel` or `Factory`
