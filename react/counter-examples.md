---
sidebar_position: 3
---

# Counter examples

Let's create simple "counter app" examples using **Async Redux**.

The examples below are editable and runnable.
You can change the code and see the results in real-time.

## State as a number

Let's start as simple as possible.
In this first example, the state is just a number of type `number`,
and the initial state is `0`:

```tsx
const store = new Store<number>({
  initialState: 0,
});
```

We'll create an `Increment` action that increments that state by 1, every time it's dispatched.
Since the state itself is just a number,
the action reducer must return `this.state + 1` to increment it.

```tsx
class Increment extends ReduxAction<number> {
  reduce() {
    return this.state + 1; 
  }
}
```

To create a component that shows the counter in the screen,
we use the `useAllState` hook. This hooks returns the whole state,
which here is the counter value itself: `const counter = useAllState()`.

We also need a second hook called `useStore`, which gives us a reference to store
with `const store = useStore()`. This is necessary because when the user clicks
a button we want to dispatch the `Increment` action with `store.dispatch(...)`.

Please read the code below and see if you understand everything.

<iframe
src="https://codesandbox.io/embed/vprx7v?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '500px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

<br></br>         
<br></br>

Try modifying the above code to add a second button named "Decrement" that decrements the counter
by 1 by dispatching an action called `Decrement`.

## State as a plain JavaScript object

In this second example, the state is a plain JavaScript object.
If we use TypeScript, we can define its type like this:

```tsx
type State = {
  counter: number;
};
```

The initial state is an object with counter zero:

```tsx
const store = new Store<State>({
  initialState: {
    counter: 0,
  },
});
```

The `Increment` action increments the state by 1.
The state is an object of type `State`, which means the counter is `state.counter`.
The action reducer returns a new object, incrementing the counter by one:
`{ counter: this.state.counter + 1 }`.

```tsx
class Increment extends ReduxAction<State> {
  reduce() {
    return {
      counter: this.state.counter + 1,
    }; 
  }
}
```

To show the counter in the screen we could still use the `useAllState` hook,
which returns the whole state, and then just get the counter value:

```tsx
const state = useAllState();
const counter = state.counter;
```

However, this would mean that every time the state changed, the component would re-render.
That's ok, since in this simple example the state is just the counter anyway, but we can do better.

If we use the `useSelect` hook to "select" just the counter, the component will only re-render
when the counter changes, even when later we add more information to the state.

```tsx
const counter = useSelect((state: State) => state.counter);
```

In other words, this is an optimization which will prevent unnecessary re-renders when the parts
of the state that change are not the ones we are interested in, in this particular component.

Just as before, we'll also use the `useStore` hook to get a reference to the store and dispatch
the action.

Please read the code below, see if you understand everything,
and compare it with the previous example.

<iframe
src="https://codesandbox.io/embed/j57yz5?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '500px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## State as a class

In this third example, the state is of type `State`, which is a **class** we'll create.
It could contain all sorts of information, but in this case, it's just a number counter:

```tsx
class State {
  constructor(public readonly counter: number = 0) {}
}
```

The initial state is an instance of this class: `new State(0)`:

```tsx
const store = new Store<State>({
  initialState: new State(0),
});
```

The `Increment` action increments the state by 1.
The state is an instance of `State`, which means the counter is `state.counter`.
The action reducer returns a new instance of the class, incrementing the counter by one:
`new State(this.state.counter + 1)`.

```tsx
class Increment extends ReduxAction<State> {
  reduce() {
    return new State(this.state.counter + 1); 
  }
}
```

We'll use the `useSelect` hook to "select" just the counter, so that the component will only
re-render when the counter changes, even when later we add more information to the state.

```tsx
const counter = useSelect((state: State) => state.counter);
```

In other words, this is an optimization which will prevent unnecessary re-renders when the parts
of the state that change are not the ones we are interested in, in this particular component.

Just as before, we'll also use the `useStore` hook to get a reference to the store and dispatch
the action.

Please read the code below, see if you understand everything,
and compare it with the previous examples.

<iframe
src="https://codesandbox.io/embed/ysfgmk?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '500px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## State modifies itself

If you look at the `Increment` action, you'll see it reads the counter
from the current state, and uses it to create a new, modified state:

```tsx
class Increment extends ReduxAction<State> {
  reduce() {
    return new State(this.state.counter + 1); 
  }
}
```

While this works, it's breaking the **encapsulation** of the `State` class.
In other words, the knowledge of how to modify the state is outside the state itself.

We can fix this by adding a class function (or more precisely, a _method_) to
the `State` class that increments the counter.

```tsx
class State {
  constructor(public readonly counter: number = 0) {}
  
  increment() { 
    return new State(this.counter + 1); 
  }  
}
```

Now, the `Increment` action may simply call this function:

```tsx
class Increment extends ReduxAction<State> {
  reduce() {
    return this.state.increment();
  }
}
```

This is a better design, because:

* The `State` class now encapsulates all the knowledge of how to modify itself.
  You may think this is a small improvement, and it is, but it will make a big difference
  in a real app, when the state becomes complex.

* Adding such functions make it trivial to modify the state and keep it immutable,
  without you ever needing external libraries like [Immer](https://www.npmjs.com/package/immer).

* Finally, it makes the code much easier to test, as you can test the `State` class in isolation,
  without needing to create actions and reducers.

To sum up:

:::tip

In the action, avoid directly accessing parts of the current state to create the new state.
Instead, add functions to the state class that return a new instance with the updated
state, and call these functions from the action.

:::

<br></br>

Check the following code.
It includes state functions to increment and decrement the state, `Increment` and `Decrement`
actions, and respective buttons to dispatch them.

<iframe
src="https://codesandbox.io/embed/65vkrq?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '500px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## Functions calling functions

In the above code, the `State` class above has two functions, `increment` and `decrement`:

```tsx
class State {
  constructor(public readonly counter: number = 0) {}
  
  increment() { 
    return new State(this.counter + 1); 
  }
  
  decrement() { 
    return new State(this.counter - 1); 
  }   
}
```

Since functions can call other functions, we can create a parameterized `add` function,
and then modify `increment` and `decrement` to use it:

```tsx
class State {
  constructor(public readonly counter: number = 0) {}

  add(value: number) {
    return new State(this.counter + value);
  }

  increment() { return this.add(1); }
  decrement() { return this.add(-1); }
}
```

Creating simple functions, and then composing them to create more complex, specialized functions,
is a good idea that will simplify your code.

We can also create parameterized **actions**.
For example, we can create an `Add` action that receives a number and calls the `add` function:

```tsx
class Add extends ReduxAction<State> {
  constructor(readonly value: number) { super(); }
    
  reduce() {
    return this.state.add(this.value);
  }
}
```

In the `Increment` and `Decrement` buttons, we can now dispatch the `Add` action with `1` and `-1`:

```tsx
<Button onClick={() => store.dispatch(new Add(1))}>Increment</Button>
<Button onClick={() => store.dispatch(new Add(-1))}>Decrement</Button>
```

## Defining a Base action

A real app may have dozens or hundreds of actions.
Since all of them must extend `ReduxAction<State>`, let's create a base class for them,
called `Action`:

```tsx
class Action extends ReduxAction<State> {}
```

Now, all actions can extend `Action` instead of `ReduxAction<State>`. For example:

```tsx
class Add extends Action {
  constructor(readonly value: number) { super(); }
    
  reduce() {
    return this.state.add(this.value);
  }
}
```

<iframe
src="https://codesandbox.io/embed/vszmfw?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '500px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## Testing state and actions

I suggest you create tests for all your **state** classes.

For example, this is how you could test the above `State` class with [Jest](https://jestjs.io/):

```tsx
import { State } from './path-to-your-state-file'; 

describe('State', () => {

  it('should initialize with a default counter of 0', () => {    
    expect(new State().counter).toBe(0);
  });

  it('should initialize with a given counter value', () => {    
    expect(new State(5).counter).toBe(5);
  });

  it('should increment the counter by 1', () => {      
    expect(new State().increment().counter).toBe(1);
  });

  it('should decrement the counter by 1', () => {       
    expect(new State(5).decrement().counter).toBe(4);
  });

  it('should add a given value to the counter', () => {    
    expect(new State(5).add(3).counter).toBe(8);
  });
});
```

<br></br>

You can also create tests for your **actions**.

However, if your actions mostly call functions in your state classes,
and you already tested those functions as shown above, don't test all the variations again.

Just test enough to make sure the actions are calling the right functions with the right parameters.
For example, this is how I would test the `Add` action, just to make sure it's wired to the `add`
function.

```tsx
import { Store } from 'path-to-your-store-file';
import { State } from 'path-to-your-state-file';
import { Add } from 'path-to-your-action-file';

describe('Add action', () => {
  let store;

  beforeEach(() => {
    store = new Store<State>({ initialState: new State(3) });
  });

  it('should increment the counter by the given value', () => {
    store.dispatch(new Add(5));
    expect(store.state.counter).toBe(8);
  });
});
```

## Asynchronous counter

As one last example, let's create an asynchronous counter.

When the user clicks a button, we'll wait for **1 second** before incrementing the counter.

The async process in this case is simply waiting for 1 second, but note it could be anything
that takes time to finish, like fetching data from a server.

Importantly, while the async process is running the button will be disabled,
so that the user must wait to click the button again.

This is the original, synchronous `Increment` action:

```tsx
class Increment extends Action {
  reduce() {  
    return this.state.add(1);
  }
}
```

To make it asynchronous, we need to:

* Mark the `reduce` function as `async`.
* Add an `await new Promise(...)` that waits for 1 second.
* Instead of returning a new state, return a **function** that returns a new state.

This is the result:

```tsx
class Increment extends Action {
  async reduce() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return (state) => this.state.add(1);
  }
}
```

<br></br>

We also want to disable the button while the async process is running.
In the component, we can use the `useIsWaiting` hook
to get a boolean that tells us if we're currently waiting for a specific action to finish or not.

In our case, we want to wait until the `Increment` action finishes:

```tsx
const isWaiting = useIsWaiting(Increment);
```

This is the original button:

```tsx
<button onClick={() => store.dispatch(new Increment())}>
  Increment
</button>    
```

All we need to do is set the button's `disabled` property:

```tsx
<button 
    disabled={isWaiting} 
    onClick={() => store.dispatch(new Increment())}>
  Increment
</button>    
```

Try pressing the "Increment" button and see that it disables for 1 second before incrementing the
counter:

<iframe
src="https://codesandbox.io/embed/gjh3dj?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '500px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

<br></br>
<br></br>

To adapt our tests for the `Increment` action being asynchronous,
we need to apply a small change to them. This doesn't work anymore:

```tsx
it('should increment the counter by one', () => {
  let store = new Store<State>({ initialState: new State(3) });
  
  store.dispatch(new Increment()); // Here. 
  expect(store.state.counter).toBe(4);
});
```

If we dispatch an asynchronous action with function `dispatch`, as shown above, 
this function it will return immediately,
and the test will check the state before the action finishes.

Instead, we should use `dispatchAndWait`, which returns a `Promise` that
resolves when the action finishes.
This means we can use `await` to wait for the action to finish, and then check the state:

```tsx
it('should increment the counter by one', async () => {
  let store = new Store<State>({ initialState: new State(3) });
  
  await store.dispatchAndWait(new Increment()); // Here.
  expect(store.state.counter).toBe(4);
});
```

Note: If you prefer not to worry about whether actions under test are synchronous or asynchronous,
you can always use `dispatchAndWait` instead of `dispatch`. It works in both cases.
