---
sidebar_position: 20
---

# Business logic

Where to put your business logic?

* Actions, reducers and state classes are part of the **business code**.
* Widgets, Connectors and ViewModels are part of the **client code**.

## Rules of thumb

* Recommended: Put your business logic in your state classes  
* You can also put your business logic in your Action reducers, but that's not the best place

However:
 
* Don't put your business logic in Widgets
* Don't put your business logic in Connectors
* Don't put your business logic in the ViewModels of Connectors
