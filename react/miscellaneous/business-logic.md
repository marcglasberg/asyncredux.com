---
sidebar_position: 20
---

# Business logic

Where to put your business logic?

* State, actions and reducers are **business code**.
* Components are **client code**.

## Rules of thumb

* Recommended: Put your business logic in your state classes or objects.  
* You can also put your business logic in your reducers, but that's not the best place.

However:
 
* Don't put your business logic in components
* Don't put your business logic in custom hooks
