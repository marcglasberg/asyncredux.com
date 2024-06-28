---
sidebar_position: 9
---

# Hooks to dispatch actions

You can use the provided hooks to dispatch actions from inside React components.
                                                                                
## useDispatch etc

You can directly use 
hooks `useDispatch`, `useDispatchAll`, `useDispatchAndWait`
and `useDispatchAndWaitAll`.

For example:

```tsx
function MyComponent() { 
  const dispatch = useDispatch();  

  return (
    <Button onClick={() => dispatch(new LoadText())}> 
      Click me! 
    </Button>
  );
};
```

## useStore

Alternatively, getting a store reference with `useStore` also allows you to dispatch actions
with `store.dispatch`, `store.dispatchAll`, `store.dispatchAndWait` and `store.dispatchAndWaitAll`.

For example:

```tsx
function MyComponent() { 
  const store = useStore();  

  return (
    <Button onClick={() => store.dispatch(new LoadText())}> 
      Click me! 
    </Button>
  );
};
```
