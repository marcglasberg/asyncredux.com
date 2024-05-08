---
sidebar_position: 11
---

# IDE Navigation

In vanilla Redux, actions and reducers are separate objects, and it may not be straightforward
to know which reducers will run when you dispatch an action. You also need to manually wire
reducers to actions, and in practice it gets difficult to navigate from the code that dispatches
your action to the corresponding reducers.

In Async Redux, however, if you need to see what some action does, you just tell your IDE to
navigate to the action itself (`CTRL+B` in IntelliJ/Windows, for example) and you have the
reducer right there. There is no manual wiring, as reducers are simply methods of action objects.

If you need to list all of your actions, you just go to the `ReduxAction` class declaration
(or your base `AppAction` class, if you have it) and ask
the IDE to list all of its subclasses.
