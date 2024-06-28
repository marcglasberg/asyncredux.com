---
sidebar_position: 1
---

# Before and after the reducer

Suppose you want to prevent the user from touching the screen, while an async action is running.
This means adding a modal barrier before the action starts, and removing it after the action ends.

Or suppose you want to check some precondition when an action is dispatched,
and maybe throw an error if the precondition is not met.

It's indeed common to have some side effects both before and after the reducer runs.
To help you with these use cases, you may override your action functions `before()`
and `after()`, which run respectively before and after the reducer.

:::note

Implementing your action's `reduce()` function is mandatory,
but `before()` and `after()` are optional.
Their default implementation simply does nothing.

:::

## Before

The `before()` function runs before the reducer.

To run synchronously, return `void`.
To run it asynchronously, add `async` and return `Promise<void>`:

```ts
// Sync
before(): void {
  ...
}

// Async
async before(): Promise<void> {
  ...
}
```

What happens if `before()` throws an error? In this case, `reduce()` will **not** run.
This means you can use `before()` to check any preconditions,
and maybe throw an error to prevent the reducer from running. For example:

```ts
// If there is no internet connection, throws a UserException 
// to show a dialog and prevent the reducer from running.
async before(): Promise<void> {
  if (!(await hasInternetConnection())) 
    throw new UserException('No internet connection');
}
```

:::note

If `before()` returns a promise, then the action becomes async
(its reducer will complete in a later microtask than the dispatch call),
regardless of the `reduce()` function being sync or async.

:::

## After

Function `after()` runs after the reducer. It's always a synchronous function:

```ts
after(): void {
  ...
}
```

Note `after()` is akin to a _finally block_,
since it will always run, even if an error was thrown by `before()` or `reduce()`.
This is important so that it can undo any side effects that were done in `before()`,
even if there was an error later in the reducer.

:::note

Make sure your `after()` function doesn't throw an error.
If it does, the error will be swallowed, but logged with `Store.log()`.
Keep in mind the default logger will print the error to the console,
but you may provide your own `logger` to the `Store` constructor.

:::

## Example

Suppose we have a counter app. When you press the "Increment" button,
it dispatches the `Increment` action, that takes 1 second to increment the counter.
This action adds a dark screen barrier when it starts,
and then removes the barrier when it finishes.

First, we need to create a `BarrierAction`:

```ts
class BarrierAction extends Action {
  constructor(public hasBarrier: boolean) { super(); }

  reduce() {
    return this.state.copy(hasBarrier: this.hasBarrier);
  }
}
```

And then we need a barrier component which occupies the whole screen
and is shown only when `hasBarrier` is true:

```tsx
function Barrier() {
  let hasBarrier = useSelect((state: State) => state.hasBarrier);
  
  return hasBarrier 
    ? <div className="Barrier" /> 
    : <></>;
}
```

```css title="CSS"
.Barrier {
  position: fixed; z-index: 9999;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4);  
}
```

After this is set up, you may use `before()` and `after()` to dispatch the `BarrierAction`:

```ts
class Increment extends Action {

  async reduce() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return (state: State) => this.state.increment();
  }

  before() { this.dispatch(new BarrierAction(true)); }
  after() { this.dispatch(new BarrierAction(false)); }
}
```

<iframe
src="https://codesandbox.io/embed/255qf8?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '650px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## Creating a base action

You may also modify your [base action](./base-action) to make it easier
to add this behavior to multiple actions:

```ts
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

export abstract class Action extends ReduxAction<State> {
  barrier = false;  
  before() { if (this.barrier) this.dispatch(new BarrierAction(true)); }
  after() { if (this.barrier) this.dispatch(new BarrierAction(false)); }  
}
```

Now you can add `barrier = true;` in all your desired actions,
to provide `before()` and `after()` by default:

```ts
class Increment extends Action {

  barrier = true;
  
  async reduce() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return (state: State) => this.state.increment();
  }
}
```

This is the code using the modified `BaseAction` and `Increment` actions:

<iframe
src="https://codesandbox.io/embed/vhy8t9?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser"
style={{ width:'100%', height: '450px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

