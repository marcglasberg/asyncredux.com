---
sidebar_position: 20
---

# Business logic

Where to put your business logic?

Widgets, Connectors and ViewModels are part of the client code. If you use the recommended directory
structure, they should be in the client directory, which is **not** visible to the business code.

Actions, reducers and state classes are part of the business code. If you use the recommended
directory structure, they should be in the business directory, which is visible to the client code.

Rules of thumb:

* Don't put your business logic in the Widgets.
* Don't put your business logic in the Connectors.
* Don't put your business logic in the ViewModels of the Connectors.
* Put your business logic in the Action reducers.
* Put your business logic in the State classes.
