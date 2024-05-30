---
sidebar_position: 1
---

# Introduction

Async Redux is an optimized Redux version, which is very easy to learn and use,
yet powerful and tailored for React.
It has none of the boilerplate of the original vanilla Redux.
See below the comparison with Redux Toolkit, MobX and Zustand.

While Async Redux is new for React, it has been available
for [Flutter](https://pub.dev/packages/async_redux) for a few years,
where it ranks among the top 8% of most-used packages, meaning its features have
been battle-tested in hundreds of real-world applications.

## Easy to use

Async Redux's whole focus is on being easy for developers to use.
I'm consistently incredulous at things front end developers have to deal with,
and the large overhead knowledge that is needed just to navigate the pitfalls
of the tools they use. I want to make Async Redux the opposite of that:
You don't need to be super clever about approaching things just to make it work.

Despite being easy to use, Async Redux is powerful enough
to handle complex applications with millions of users.

<hr></hr>

## Comparisons

### Comparing with Redux Toolkit

Redux Toolkit was created to make it easier to write Redux applications,
but it still forces you into a lot of boilerplate.
It doesn't handle async processes well, and forces you to use middleware,
through hard-to-use packages like `redux-thunk` or `redux-saga`.

Async Redux has common goals with Redux:
Being predictable, helping write applications that behave consistently,
centralizing the application state and logic, and allowing easy debugging.

But Async Redux is easy to use. It has no code in common with the vanilla Redux core,
and was completely rewritten with simplicity in mind and eliminating boilerplate.
It handles async processes natively, and you don't need to think about middleware.

### Comparing with MobX

Writing MobX applications seems very easy at first, but soon a lot of complexity
arises, particularly when dealing with deeply nested structures or needing more features
like serialization.

To try and fix this, MobX-State-Tree was created, but doesn't play well with TypeScript,
and breaks IDE navigation. To try and fix MobX-State-Tree, MobX Keystone was created,
but it's also complex, and crashes with bad error messages that don't explain the
problem, or don't say where the problem is.

Async Redux aims to be very easy at first, but also to continue being easy when
the inevitable complexity of web and mobile development arises.
It works perfectly with TypeScript and allows for easy IDE navigation.

### Comparing with Zustand

Zustand is a barebones state management solution,
providing just the essentials needed for state management without extensive
setup or complexity. For advanced features you need to install separate packages.

Async Redux also doesn't need any extensive setup, and is not more complex than Zustand.
However, Async Redux is not barebones: The advanced features are there when you need them.

For example, it deals natively with serializing, running async processes, displaying spinners
while loading, showing error messages, saving the state to the local storage, and testing.

### Comparing with TanStack Query

TanStack Query is a data-fetching and caching library for React,
that was later rebranded as an asynchronous state management.

While Redux leaves out dealing with async processes, TanStack Query goes to the other extreme
and sees state management as just dealing with async data fetching and caching.
In my opinion, thinking of state management in terms of data fetching is the wrong abstraction.

Async Redux manages state through actions, which can be sync or async and change the state 
in any way, not just fetch data.
Action can fail and they can succeed. You can wait for them to finish, retry them, debounce, 
throttle them and do optimistic updates.

### ES6 classes

One difference between Async Redux and the state management solutions mentioned above
is that Async Redux plays well with ES6 classes.

In special, **actions** are implemented as ES6 classes,
while **reducers** are class functions:

```tsx
class Increment extends Action {

  reduce() { 
    return this.state + 1;  
  };
}
```

Some developers don't like JavaScript classes,
stating they are not "real classes"
but simply syntactic sugar over prototypes.

However, it's precisely that syntactic sugar that Async Redux makes use of,
with the sole goal of making your code more organized and easier to navigate.

It's not important you learn or understand class features like inheritance or polymorphism.
You can use them as simple namespaces, in the way prescribed in this documentation,
and you'll be fine.

You'll see they allow reduced boilerplate, and allow you to navigate between actions and reducers
with a simple click, in IDEs like VS Code and IntelliJ.

Regarding your application **state**, it can be composed of both plain JavaScript objects or 
ES6 classes. I personally also like to use ES6 classes as state,
because they make it trivial to create and change immutable state,
without the need for libraries
like [Immer](https://www.npmjs.com/package/immer).

Also note, Async Redux can serialize ES6 classes just fine.

### Framework support

Currently, Async Redux has deep integration with React, which is important to make it easy to use.

It's entirely possible to make Async Redux work with any other frameworks, like Solid, Vue, Svelte
or Angular, but a separate package would be needed for each. For the moment, only React is
supported.

<hr></hr>

Next, let's follow a short tutorial to see how easy it is to use Async Redux.
We'll create a simple _Todo List_ app.

