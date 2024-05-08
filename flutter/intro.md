---
sidebar_position: 1
---

# Introduction

Async Redux is an optimized Redux version, which is very easy to learn and use,
yet powerful and tailored for Flutter. 
It has none of the boilerplate of the original vanilla Redux.

It's by now a mature package used by hundreds of companies and independent developers,
being suitable for applications ranging from the simplest to the most complex and supporting
millions of users.

Async Redux is a complete state management solution, and doesn't compete with
packages like Provider and Flutter Hooks, which are not. On the contrary, it can
optionally be [used with them](./category/other-packages), although that's not necessary.

However, Async Redux is an alternative to Bloc, MobX, and the original vanilla Redux. 
It aims to be way easier to use than those, and to help you create stable apps 
that are easier to test, maintain and extend.

## Example projects

Please visit:

* **Fully documented:**
  > The <a href="https://github.com/marcglasberg/SameAppDifferentTech/">Same App
  Different Tech
  Project</a> is a repository in GitHub, containing the same mobile app implemented using a variety
  of different tech stacks, including
  a <a href="https://github.com/marcglasberg/SameAppDifferentTech/blob/main/MobileAppFlutterRedux/README.md">
  Redux App Example</a>.

* **Documented in the source code only:**
  > The <a href="https://github.com/marcglasberg/redux_app_example">Redux App Example</a>
  repository in GitHub also contains a full-fledged example with a complete app showcasing the
  fundamentals and best practices described in this Readme.

## What is Redux?

A single **store** object holds all the application **state**, which is immutable.
When you need to modify some state, you **dispatch** an **action**.
Then a **reducer** creates a new copy of the state, with the desired changes.
Your widgets know when the state changes, and rebuild as needed.

## Why use this Redux version over others?

The original vanilla Redux version is too low-level, which makes it very flexible but results in a
lot of boilerplate, and a steep learning curve. These are some of its problems:

* Combining reducers is a manual task, and you have to list them one by one.
  If you forget to list some reducer, you will not know it until your tests point out
  that some state is not changing as you expected.

* Reducers can't be async, so you need to create middleware, which is also difficult to set up and
  use. You have to list them one by one, and if you forget one of them you will also not know it
  until your tests point it out. The `redux_thunk` package can help with that, but adds some more
  complexity.

* It's difficult to know which actions fire which reducers, and hard to navigate the code in the
  IDE. In IntelliJ, you may press CTRL+B to navigate between a method use and its declaration.
  However, this is of no use if actions and reducers are independent classes. You have to search for
  action "usages", which is not so convenient since it also list dispatches.

* It's also difficult to list all actions and reducers, and you may end up implementing some reducer
  just to realize it already exists with another name.

* Testing reducers is simple, since they are pure functions, but integration tests are difficult. In
  the real world you need to test complex middleware that fires other middleware and many reducers,
  with intermediate state changes that you want to test for. Especially if you are doing BDD or
  Acceptance Tests you may need to wait for some middleware to finish, and then dispatch some other
  actions, and test for intermediate states.

* It assumes it holds all the application state, and this is not practical in a real Flutter app.
  If you add a simple `TextField` with a `TextEditingController`, or a `ListView` with
  a `ScrollController`, then you have state outside the Redux store. Suppose your middleware is
  downloading some information, and it wishes to scroll a `ListView` as soon as the
  info arrives. This would be simple if the list scroll position is saved in the Redux store.
  However, this state must be in the `ScrollController`, not the store.

Async Redux solves all of these problems and more:

* It's much easier to learn and use than the original vanilla Redux.
* It comes with its own testing tools that make even complex tests easy to set up and run.
* You can navigate between action dispatches and their corresponding reducers with a single IDE
  command or click.
* You can also use your IDE to list all actions/reducers.
* You don't need to add or list reducers and middleware anywhere.
* In fact, reducers can be async, so you don't need middleware.
* There is no need for generated code (as some Redux versions do).
* It has the concept of "events", to deal with Flutter state controllers.
* It helps you show errors thrown by reducers to the user.
* It's easy to add both logging and store persistence.
