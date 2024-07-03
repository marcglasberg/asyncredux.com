---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting Started

Async Redux is, at the same time:

* Very powerful
* Simple and easy to use

This means you'll be able to create your websites and apps much faster,
and other people in your team will be able to easily understand your code and modify it.

## What is it?

Async Redux is an optimized Redux version, tailored for React.

It was created by [Marcelo Glasberg](https://github.com/marcglasberg),
and launched in July 2024.

While Async Redux is new for React, It's considered mature.
It's been available for [Flutter](https://pub.dev/packages/async_redux) for a few years,
where it ranks among the top 8% of most-used packages,
meaning its features have been battle-tested in hundreds of real-world applications.

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

Async Redux was written from the ground up, and has no code in common with
the original Redux and Redux Toolkit.

Follow these links if you want to compare Async Redux with other state management solutions:

* [Comparing with Redux Toolkit](./comparisons/comparing-redux.md)
* [Comparing with TanStack Query](./comparisons/comparing-tanstack.md)
* [Comparing with Zustand](./comparisons/comparing-zustand.md)
* [Comparing with MobX](./comparisons/comparing-mobx.md)

## Easy to use

Async Redux's whole focus is on being easy for developers to use.
I'm consistently incredulous at things front end developers have to deal with,
and the large overhead knowledge that is needed just to navigate the pitfalls
of the tools we use. I want to make Async Redux the opposite of that:
You don't need to be super clever about approaching things just to make it work.

Despite being easy to use, Async Redux is powerful enough
to handle complex applications with millions of users.

## Framework support

Currently, Async Redux has deep integration with React.
This deep integration is important to make it easy to use.

It's entirely possible to make Async Redux work with any other frameworks, like Solid, Vue, Svelte
or Angular, but a separate package would be needed for each. For the moment, only React is
supported.

<hr></hr>

Next, let's follow a short tutorial to see how easy it is to use Async Redux.
We'll create a simple _Todo List_ app.

