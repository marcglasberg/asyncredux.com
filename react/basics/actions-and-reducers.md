---
sidebar_position: 4
---

# Actions and reducers

In Async Redux, an **action** is any class you create that extends `ReduxAction<State>`.

The `ReduxAction` is a built-in class provided by Async Redux,
and `State` is the type you defined for your application [state](./store-and-state).

For example, this is how you can declare an `Increment` action,
that could be used in a [counter application](./counter-app-examples):

```tsx
import { ReduxAction } from "async-redux-react";
import { State } from 'State';

class Increment extends ReduxAction<State> { }
```

## The reducer

All your actions must implement a function called `reduce()`.
Your IDE will show a compile-time error if you forget to implement it.

```tsx
class Increment extends ReduxAction<State> {

  reduce() { 
    // ... 
  }
}
```

The `reduce()` function is called a **reducer**.

We'll soon see that when actions are "[dispatched](./dispatching-actions)",
its reducer will be called to calculate state changes in your app.

To achieve this, the reducer has direct access to the current application state
through `this.state`, and then it must return a new state. For example:

```tsx
class Increment extends ReduxAction<State> {

  reduce() { 
    // The reducer has access to the current state
    return new State(this.state.counter + 1); // Returns a new state 
  }
}
```

:::tip

In the code that dispatches an action, you can use your IDE to click the action name and go to where
the action is defined. There, you'll find the reducer for that action, which explains what happens
when the action is dispatched.

In other words, the action and its reducer are part of the same data structure,
keeping your code organized.

:::

## Base action

Having to write `extends ReduxAction<State>` in every action definition can be cumbersome.

In all the code I show in this documentation, you'll see I usually write `extend Action`
instead of `extend ReduxAction<State>`.

This is because I'm assuming you have previously defined your own abstract base action class
called simply `Action`, that itself extends `ReduxAction<State>`. Then, you may have all your
actions extend this `Action` class instead.

This is how you can define the `Action` class in your own code:

```tsx 
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

export abstract class Action extends ReduxAction<State> { }
```

And then:

```tsx
import { Action } from './Action';

class Increment extends Action { 
  // ... 
}
```

Later, we'll see that the base action is also a good place to
put [common logic](../advanced-actions/base-action-with-common-logic).

## Actions can have parameters

The above `Increment` action is simple and doesn't take any parameters.

But actions can take any number of parameters, just like functions.
Consider the following `Add` action:

```tsx
class Add extends Action {
  constructor(readonly value: number) { super(); }
    
  reduce() {
    return this.state.add(this.value);
  }
}
```

In the above example, the `Add` action takes a `value` parameter in its constructor.
When you dispatch the `Add` action, you pass the value as a parameter:

```tsx
dispatch(new Add(5));
```

Note the reducer has direct access to the `value` parameter through `this.value`.

## Actions can do asynchronous work

The simplest type of action is _synchronous_, meaning it doesn't involve any asynchronous operation.
We can know an action is sync by looking at its reducer, which is declared with `reduce()`.

However, action can download information from the internet, or do any other async work.
To make an action async, declared it with `async reduce()` and then returns a `Promise`.

Also, instead of returning the new state directly, you should return a **function** that
will change the state.

For example, consider the following `AddRandomText` action,
that fetches a random text from the internet and adds it to the state:

```tsx 
class AddRandomText extends Action {

  async reduce() {
    let response = await fetch("https://dummyjson.com/todos/random/1");        
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;
     
    return (state) => state.copy({text: text}));
  }
} 
``` 

:::note

If you want to understand the above code in terms of traditional Redux patterns,
the beginning of the `reduce` method is the equivalent of a middleware,
and the return function `(state) => state.copy({text: text}))` is the equivalent of
a traditional pure reducer.

It's still Redux, just written in a way that is easy and boilerplate-free.
No need for Thunks or Sagas.

:::

## Actions can throw errors

If something bad happens, your action can simply **throw an error**.
In this case, the state will not change.

Let's modify the previous `AddRandomText` action to throw an error if the fetch fails:

```tsx
import { UserException } from "async-redux-react";

class AddRandomText extends Action {

  async reduce() {
    let response = await fetch("https://dummyjson.com/todos/random/1");
    if (!response.ok) throw new UserException("Failed to load.");
    
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;
     
    return (state) => state.copy({text: text}));
  }
} 
```

Notes:

* Any errors thrown by actions are caught globally and can be handled in a central place.
  More on that, later.

* Actions can throw any type of errors. However, if they throw a `UserException`
  (provided by Async Redux), a dialog or other UI will open automatically,
  showing the error message to the user.

<hr></hr>

Next, let's see how and why you can have actions that don't modify the state.
