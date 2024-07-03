---
sidebar_position: 1
---

# Store and state

The first thing you need to do to use Async Redux is to create a **store**,
which is a centralized place to hold all your application **state**.

You can create a store by using the `createStore` function,
or with `new Store()`:

```tsx
// Using createStore
const store = createStore<State>();

// Using new Store
const store = new Store<State>(); 
```

## Initial state

When you create the store you can provide a few parameters.
Most are optional, but you must at least provide the **initial state**:

```tsx
const store = createStore<State>({ initialState: ... });
const store = new Store<State>({ initialState: ... }); 
```

### State as a number

Let's start as simple as possible.
In this first example, the state is just a number of type `number`,
and the initial state is `0`:

```tsx
const store = createStore<number>({
  initialState: 0,
});
```

### State as a plain JavaScript object

In this second example, the state is a plain JavaScript object.
If we use TypeScript, we can define its type like this:

```tsx
type State = {
  counter: number;
};
```

The initial state is an object with counter zero:

```tsx
const store = createStore<State>({
  initialState: {
    counter: 0,
  },
});
```

### State as an ES6 class

One difference between Async Redux and most other JavaScript state management solutions
is that Async Redux plays well with ES6 classes.

Some developers don't like JavaScript classes, stating they are not "real classes"
but simply syntactic sugar over prototypes.

However, it's precisely that syntactic sugar that Async Redux makes use of,
with the sole goal of making your code more organized and easier to navigate.

It's not important you learn or understand class features like inheritance or polymorphism.
You can use them as simple namespaces, in the way prescribed in this documentation,
and you'll be fine.

You'll see they allow reduced boilerplate, and allow you to navigate between actions and reducers
with a simple click, in IDEs like VS Code and IntelliJ.

Also note, Async Redux can serialize ES6 classes just fine.

In this third example, the state is of type `State`, which is a **class** we'll create.
It could contain all sorts of information, but in this case, it's just a number counter:

```tsx
class State {
  constructor(public readonly counter: number = 0) {}
}
```

The initial state is an instance of this class: `new State(0)`:

```tsx
const store = createStore<State>({
  initialState: new State(0),
});
```

## Choice

As shown above, your state can be composed of both plain JavaScript (or TypeScript) objects,
or ES6 classes. Feel free to use the one you prefer.

All examples in this documentation use ES6 classes as state,
but keep in mind that Async Redux works just as well with plain JavaScript objects.

I personally prefer using ES6 classes as state,
because I find them very readable, easy to use,
and they make it trivial to create and change **immutable state**,
without the need for libraries like [Immer](https://www.npmjs.com/package/immer).

## Immutable state

In Async Redux, your state must be **immutable**.

In other words, when you want to change the state, you must create a new state object with the
desired changes, instead of modifying the existing one.

For example, this is a **mutable** state class with an `increment` method:

```tsx
class State {
  constructor(public counter: number = 0) {}

  increment() {
    this.counter++;
  }
}
```

The above state class **cannot** be used with Async Redux, because it's mutable.
Instead, use an immutable version, where the `increment` method returns a new state:

```tsx
class State {
  constructor(public readonly counter: number = 0) {}

  increment() {
    return new State(this.counter + 1);
  }
}
```

:::tip

If you decide to use plain JavaScript objects, you may want to use a library
like [Immer](https://www.npmjs.com/package/immer) to help you with immutability.

:::

<hr></hr>

Now that we know how to create the state and the state,
let's see next how to make them available to your component tree.
