---
sidebar_position: 9
---

# Wait, fail, succeed

A common pattern in app development involves having a process that can either succeed or fail.
You want to display a spinner during the process, show the result when it completes,
and present an error message if it fails.

These are called "process states":

* **Waiting**: The process is currently running.
* **Failed**: The process failed with an error.
* **Succeeded**: The process succeeded.

In Async Redux, these processes start when actions are dispatched, which means we need a way to
know if an action is currently being processed, if it just failed, and eventually show an error.

Thankfully, this is very easy to do with Async Redux, by using the following functions:

* `isWaiting(actionType)`: Returns true if the given action type is currently being processed.
* `isFailed(actionType)`: Returns true if the given action type just failed.
* `exceptionFor(actionType)`: Returns the exception that caused the action to fail.
* `clearExceptionFor(actionType)`: Clears the exception that caused the action to fail.

## In components

In components, we have access to those functions by using the
hooks `useIsWaiting`, `useIsFailed`, `useExceptionFor` and `useClearExceptionFor`.

We have already previously seen how to read the state and dispatch actions from components:

```dart    
function MyComponent() {

  const state = useAllState(); 
  
  return (
    <div>
      <p>Counter: {state.counter}</p>
      <button onClick={() => store.dispatch(IncrementAction())}>Increment</button>
    </div>
  );
};
```

Now, let's see how to show a spinner while an action is being processed, and show an error message.

## Show a spinner

Hook `useIsWaiting(actionType)` returns true if the given action type is currently being
processed. By using this hook, you can show a spinner while an action is being processed:

```dart
function MyComponent() {

  const isWaiting = useIsWaiting(IncrementAction);
  const state = useAllState(); 
    
  return (
    <div>
      {
      isWaiting 
        ? <CircularProgress /> 
        : <p>Counter: {state.counter}</p>
      }
    </div>
  );
};
```

## Show an error message

Hook `useIsFailed(actionType)` returns true if the given action type just failed.
By using this hook, you can show an error message when an action fails:

```dart
function MyComponent() {

  const isFailed = useIsFailed(IncrementAction);
  const state = useAllState(); 
    
  return (
    <div>
      {
      isFailed 
        ? <p>Loading failed...</p> 
        : <p>Counter: {state.counter}</p>
      }
    </div>
  );
};
```

If the action failed with an `UserException`, you can get this error by doing
`let error = useExceptionFor(actionType)` and then get the error message
to eventually show it in the UI.

```dart
function MyComponent() {

  const isFailed = useIsFailed(IncrementAction);
  const exception = useExceptionFor(IncrementAction);
  const state = useAllState(); 
    
  return (
    <div>
      {
      isFailed 
        ? <p>Loading failed: {exception.message}</p>
        : <p>Counter: {state.counter}</p>
      }
    </div>
  );
};
```

## Combining isWaiting and isFailed

Let's suppose we've got an async action that loads some text from a server.
You can show a spinner while the action is being processed,
and show an error message if the action fails:

```tsx
function MyComponent() {

  const isWaiting = useIsWaiting(LoadText); 
  const isFailed = useIsFailed(LoadText);  
  const state = useAllState();  
  
  if (isWaiting) return <CircularProgress />
  if (isFailed) return <p>Loading failed...</p>;
  return <p>{state.someText}</p>;
}
```

Now let's repeat the previous code, but add a button that retries the action:

```tsx
function MyComponent() {

  const isWaiting = useIsWaiting(LoadText); 
  const isFailed = useIsFailed(LoadText);  
  const state = useAllState();  
  const store = useStore();
  
  if (isWaiting) return <CircularProgress />
  
  if (isFailed) return (
    <div>
      <p>Loading failed...</p>
      <button onClick={() => store.dispatch(LoadText())}>Retry</button>    
    </div>
  );
  
  return <p>{state.someText}</p>;
}
```

As soon as the user presses the retry button, the spinner will be shown again, and the
error message will be cleared. This happens because the error message is cleared automatically
when the action is dispatched again.

You could always clear the error message explicitly by defining
`let clearExceptionFor = useClearExceptionFor();` and then calling `clearExceptionFor(LoadText)`,
but it's not necessary to do so before dispatching the action again.
