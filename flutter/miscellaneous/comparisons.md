---
sidebar_position: 24
---

# Comparisons

Front end developers learning state management solutions often feel overwhelmed by
new concepts and the amount of knowledge needed just to navigate the pitfalls.

Async Redux takes the opposite approach.
You don't need to be clever or jump through hoops just to make things work.

## Comparing with the original Redux

The original vanilla Redux is very low level. 
This gives it flexibility but also leads to lots of boilerplate and a steep learning curve. 
Here are some of its problems:

* Combining reducers is a manual process. You must list them one by one, and if you forget any of them, 
  you may only find out when tests show the state is not updating as expected.

* Reducers can't be async. You need middleware, which is not easy to set up or use. You must also list middleware one by
  one, and if you miss one you will only know when tests fail. The `redux_thunk` package helps but adds more complexity.

* It's hard to know which actions trigger which reducers, and hard to navigate the code in the IDE. 
  In IDEs you can press a key combination to go from a method call to its declaration, 
  but this does not work well when actions and reducers are in separate classes. 
  You must search for action usages, which often returns dispatches as well.

* It's difficult to list all actions and reducers, and you may end up writing a reducer only to see it already exists
  under another name.

* Testing reducers is simple since they are pure functions, but integration tests are not. In real apps you often have
  middleware that triggers other middleware and many reducers, and you may want to test intermediate state changes.

* It assumes the whole application state is in the store. This is not practical in a real Flutter app, where a lot of
  the native widgets have their own state. Suppose your middleware downloads some data and wants to scroll a `ListView` 
  when it arrives. This would be easy if the scroll position was in the store, 
  but it must be in the `ScrollController` instead.

### Why use Async Redux over the original Redux?

Async Redux solves all these problems and more:

* It's easier to learn and use than vanilla Redux.
* It includes testing tools that make even complex tests easy to write and run.
* You can navigate between action dispatches and matching reducers with a single click or command.
* You can list all actions and reducers from the IDE.
* You don't need to add or list reducers or middleware anywhere.
* Reducers can be async, so middleware is not required.
* There is no need for generated code.
* It uses Events to work with Flutter widgets that have their own state.
* It supports showing errors from reducers to the user.
* Adding logging and store persistence is simple.

