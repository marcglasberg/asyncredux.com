---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting Started

Async Redux is:

* Simple and easy to learn and use.
* Powerful enough to handle complex applications with millions of users.

This means you'll be able to create websites and apps much faster,
and other people on your team will easily understand and modify your code.

## What is it?

Async Redux is an optimized, unofficial version of Redux.
It was created by [Marcelo Glasberg](https://github.com/marcglasberg),
and launched in July 2024.

While new for React, Async Redux is a mature solution,
having been available for [Flutter](https://pub.dev/packages/async_redux) for a few years.
There, it ranks among the top 8% of most used packages,
and its features have been battle-tested in hundreds of real-world applications.

## Installation

<Tabs>
<TabItem value="npm" label="npm">

```npm
npm install async-redux-react
```

</TabItem>
<TabItem value="yarn" label="yarn">

```yarn
yarn add async-redux-react
```

</TabItem>
</Tabs>

## How does it compare?

Async Redux was written from the ground up and shares no code with the original Redux.
However, it does draw inspiration and borrows good ideas from it and from these solutions:

* [Comparing with Redux Toolkit](./comparisons/comparing-redux.md)
* [Comparing with TanStack Query](./comparisons/comparing-tanstack.md)
* [Comparing with Zustand](./comparisons/comparing-zustand.md)
* [Comparing with MobX](./comparisons/comparing-mobx.md)

## Ease of use

Front-end developers learning some of the solutions mentioned above are
often overwhelmed by the complexity of concepts they have to grasp,
and the large knowledge overhead needed just to navigate the pitfalls.

Async Redux aims to be the opposite of that:
You don't need to be super clever about approaching things just to make them work.

## Framework support

Currently, Async Redux is deeply integrated with React,
which in practice was necessary to make it really easy to use.

Although integrating Async Redux with other frameworks like Solid, Vue, Svelte,
or Angular is not difficult, a separate package would be required for each.
Currently, only React is supported.

<hr></hr>

Next, let's follow a short tutorial to see how easy it is to use Async Redux.
We'll create a simple _Todo List_ app.

