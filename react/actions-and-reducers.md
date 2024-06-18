---
sidebar_position: 6
---

# Actions and reducers

An **action** is a class that contain its own **reducer**.

```tsx
class Increment extends Action {

  reduce() { 
    // The reducer has access to the current state
    return this.state + 1; // It returns a new state 
  };
}
```

As you can see above, the reducer is simply a function named `reduce()`.
The reducer has access to the current state through `this.state`,
and then it must return a new state.

:::tip

From the point in your code that "dispatches" an action,
use your IDE to navigate to the action declaration.
There, you'll find its corresponding reducer,
which will explain what the action does when dispatched.
The action and its reducer are part of the same structure, keeping your code organized.

:::

## Actions can have parameters

The above `Increment` action is simple and doesn't take any parameters.

But actions can take any number of parameters, just like functions.
Consider the following `Add` action:

```tsx
class Add extends ReduxAction<State> {
  constructor(readonly value: number) { super(); }
    
  reduce() {
    return this.state.add(this.value);
  }
}
```

In the above example, the `Add` action takes a `value` parameter in its constructor.
When you dispatch the `Add` action, you pass the value as a parameter:

```tsx
store.dispatch(new Add(5));
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
     
    return (state) => state.copy(text: text));
  }
} 
``` 

:::note

If you want to understand the above code in terms of traditional Redux patterns,
the beginning of the `reduce` method is the equivalent of a middleware,
and the return function `(state) => state.copy(text: text))` is the equivalent of
a traditional reducer.

It's still Redux, just written in a way that is easy and boilerplate-free.
No need for Thunks or Sagas.

:::

## Actions can throw errors

If something bad happens, your action can simply **throw an error**.
In this case, the state will not change.

Let's modify the previous `AddRandomText` action to throw an error if the fetch fails:

```tsx
class AddRandomText extends Action {

  async reduce() {
    let response = await fetch("https://dummyjson.com/todos/random/1");
    if (!response.ok) throw new UserException("Failed to load.");
    
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;
     
    return (state) => state.copy(text: text));
  }
} 
```

Notes:

* Any errors thrown by actions are caught globally and can be handled in a central place.
  More on that, later.

* Actions can throw any type of errors. However, if they throw an `UserException`,
  which is a special type provided by Async Redux, 
  then a dialog (or other UI) will open automatically,
  showing the error message to the user. More on that, later.


