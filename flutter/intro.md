---
sidebar_position: 1
---

# Getting Started

Async Redux is:

* Simple to learn and easy to use
* Powerful enough to handle complex applications with millions of users
* Testable

This means you'll be able to create your apps much faster,
and other people on your team will easily understand and modify your code.

## What is it?

Async Redux is a modern version of Redux, created
by [Marcelo Glasberg](https://github.com/marcglasberg), available
on [pub.dev](https://pub.dev/packages/async_redux) since August 2019.
It's a mature solution, and its features have been battle-tested in hundreds of real-world
applications.

Since July 2024, it's also available for [React](https://www.npmjs.com/package/async-redux-react).

### How does it compare?

Async Redux is a powerful alternative to Bloc, MobX, and the original vanilla Redux, but it’s
designed to be much easier to use than those. Check out [this page](./miscellaneous/comparisons) to
compare Async Redux with the original Redux.

Async Redux is a full state management solution and doesn't compete with packages like Provider and
Flutter Hooks, which aren't full solutions. Instead, it
can [work with them](./category/other-packages) if you want, though it's not required.

## Installation

Add the dependency to your `package.json` (check
the [most recent version here](https://pub.dev/packages/async_redux)):

```yaml
  dependencies:
    async_redux: ^23.1.1
```

## Resources

After you finish learning Async Redux, you can visit these example projects:

* The
  [Stock Example App](https://github.com/marcglasberg/SameAppDifferentTech/blob/main/MobileAppFlutterRedux/README.md)
  is a complete app that allows you to buy and sell stocks to create a portfolio.
  Documented in the **source code** and the **README**.

* The [Number Example App](https://github.com/marcglasberg/redux_app_example) is a simpler app
  that allows you to get descriptions related to the numbers you type.
  Documented in the **source code only**.

<br></br>
<hr></hr>

For now, let's follow a short tutorial to see how easy it is to use Async Redux.
We'll create a simple _Todo List_ app.
