---
sidebar_position: 5
---

# Components use the state

Once you [wrapped your app with a `StoreProvider`](./store-provider),
you can access the store's state in any component, by using one of three special hooks 
provided by Async Redux.

## useAllState

The `useAllState` hook lets you access the state from any component.
The component will then rebuild whenever the state changes:

```tsx
function MyComponent() { 
  const state = useAllState();   
  
  return <div>{state.name} has {state.age} years old</div>;    
};
```

The problem with `useAllState` is that it rebuilds the component 
every time anything in the state changes,
even if the component doesn't use the part of the state that changed.

## useSelect

The `useSelect` hook (which can also be written as `useSelector`)
selects only the part of the state that your component needs.

It will rebuild only when that part changes:

```tsx
function MyComponent() { 
  const name = useSelect((state) => state.name);   
  const age = useSelect((state) => state.age);
     
  return <div>{name} has {age} years old</div>;    
};
```

In other words, it is more efficient, but also a little more verbose to use.

## useObject

Finally, the `useObject` hook is another alternative that only rebuilds when needed:

```tsx
function MyComponent() {
 
  const state = useObject((state) => {
    name: state.name, 
    age: state.age
  });
       
  return <div>{state.name} has {state.age} years old</div>;    
};
```

The component will now rebuild only when the internal properties of the selected object change.
In other words, when at least one of `name` or `age` changes.
