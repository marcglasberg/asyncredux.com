---
sidebar_position: 4
---

# Debugging the app

Creating both unit tests and integration tests with Async Redux is very easy.
If you create a lot of tests, this helps you to avoid bugs in the first place,
and you'll probably spend very little time debugging your app.

However, if you still need to manually debug your app from time to time, here are some tips:

## Viewing the state

At any moment, you can print the current store state to the console,
from inside any **component**:

```ts
const state = useAllState();
console.log(state);
```

Or from inside **actions**:

```ts
console.log(this.state);
```

Or from inside **tests**:

```ts
const store = new Store<State>({ initialState: new State() });
...

console.log(store.state);
```

## Checking actions in progress

Printing the list of actions in progress to the console can be useful for debugging,

You can get an array of the actions that are currently in progress by
using `actionsInProgress()` from inside any **component**:

```ts
const store = useStore();
console.log(store.actionsInProgress());
```

Or from inside **actions**:

```ts
console.log(this.store.actionsInProgress());
```

Or from inside **tests**:

```ts
const store = new Store<State>({ initialState: new State() });
...

console.log(store.actionsInProgress());
```

## State changes

Function `Store.describeStateChange(obj1, obj2)` returns a string
describing only the differences between two given objects.

If you take a snapshot of the store state in different moments,   
you can use this function to print the differences between them to the console.
For example:

```ts
const store = new Store<State>({ initialState: new State() });

let state1 = store.state;
await store.dispatchAndWait(new MyAction());
let state2 = store.state;

console.log(Store.describeStateChange(state1, state2));
```

## Logging state changes to the console

By default, Async Redux will use `Store.log()` to print all state changes to
the console, as this may be useful for development, testing and debugging.

Be sure to use `logStateChanges: false` in the store constructor,
to turn it off in **production**, as leaving this on may slow down your application:

```ts
// In production
const store = new Store<State>({
  initialState: new State(),
  logStateChanges: false,
});
```

## Dispatch count

Each time an action is dispatched, Async Redux increments an internal counter.
This counter can be retrieved from `store.dispatchCount`. This number may sometimes
be useful for logging and debugging.
          
