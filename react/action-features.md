---
sidebar_position: 10
---

# Action features

You can add **features** to your actions, to accomplish common tasks:

* [nonReentrant](#nonreentrant)
* [retry](#retry)
* [debounce](#debounce)
* [throttle](#throttle)
* [ignoreOld](#ignoreold)
* [checkInternet](#checkinternet)
* [optimisticUpdate](#optimisticupdate)

## nonReentrant

To prevent an action from being dispatched while it's already running,
add `nonReentrant = true` to your action.

```tsx
class LoadText extends Action { 
  nonReentrant = true;
   
  reduce() { ... }
}
```

## retry

To retry an action a few times with exponential backoff, if it fails,
add the `retry` property to your action class.

```tsx
class LoadText extends Action {   
  retry = {on: true}

  reduce() { ... }
}
```

The retry parameters are:

- Initial Delay: The delay before the first retry attempt.
- Multiplier: The factor by which the delay increases for each subsequent retry.
- Maximum Retries: The maximum number of retries before giving up.
- Maximum Delay: The maximum delay between retries to avoid excessively long wait times.

And their default values are:

- `initialDelay` is `350` milliseconds.
- `multiplier` is `2`, which means the default delays are: 350 millis, 700 millis, and 1.4 seg.
- `maxRetries` is `3`, meaning it will try a total of 4 times.
- `maxDelay` is `5000` milliseconds (which means 5 seconds).

You can change one or more of the default values.

```tsx
class LoadText extends Action {

  retry = {
    initialDelay: 350, // Millisecond delay before the first attempt
    maxRetries: 3,     // Number of retries before giving up
    multiplier: 2,     // Delay increase factor for each retry
    maxDelay: 5000,    // Max millisecond delay between retries
  }
   
  reduce() { ... }
}
```

If you want to retry unlimited times, make `maxRetries` equal to: `-1`:

```ts
class LoadText extends Action {
   retry = {maxRetries: -1};
}
```

Notes:

- If you `await dispatchAndWait(action)` and the action uses unlimited retries,
  it may never finish if it keeps failing. So, be careful when using it.

- If the `before` method throws an error, the retry will NOT happen.

- The retry delay only starts after the reducer finishes executing. For example, if the
  reducer takes 1 second to fail, and the retry delay is 350 millis, the first retry will
  happen 1.35 seconds after the first reducer started.

- When the action finally fails, the last error will be rethrown, and the previous ones
  will be ignored.

- For most actions that use `retry`, consider also making them non-Reentrant to avoid
  multiple instances of the same action running at the same time:

  ```ts
  class MyAction extends ReduxAction<State> {
     retry = {on: true}
     nonReentrant = true;
  }
  ```

- Keep in mind that all actions using the `retry` feature will become asynchronous, even
  if the original action was synchronous.

- If necessary, you can know the current _attempt number_ by using `this.attempts`.

## debounce

To limit how often an action occurs in response to rapid inputs, you can add the `Debounce` mixin
to your action class. For example, when a user types in a search bar, debouncing ensures that not
every keystroke triggers a server request. Instead, it waits until the user pauses typing before
acting.

```tsx
lass SearchText extends Action {
  constructor(public searchTerm: string) { super(); }
  
  debounce = 300 // Milliseconds
   
  async reduce()  {      
    let result = await loadJson('https://example.com/?q=', searchTerm);
    return (state) => state.copy({searchResult: result});
  }   
}
```

> Important: _this feature is still in development. It should be available soon._

## throttle

To prevent an action from running too frequently, you can add the `Throttle` mixin to your
action class. This means that once the action runs it's considered _fresh_, and it won't run
again for a set period of time, even if you try to dispatch it.
After this period ends, the action is considered _stale_ and is ready to run again.

```tsx
class LoadPrices extends Action {  
  
  throttle = 5000 // Milliseconds
   
  async reduce()  {      
    let result = await loadJson('https://example.com/prices');
    return (state) => state.copy({prices: result});
  } 
}
```

> Important: _this feature is still in development. It should be available soon._

## ignoreOld

If some action that performs a slow async process may be dispatched multiple times in a rapid
sequence, you may want to ignore its result if a newer action of the same type was
already dispatched. This
avoids [race conditions](https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect)
where the result of an older action overwrites the result of a newer one.

In Async Redux this problem can be easily solved by adding `ignoreOld = true` to
your action class:

```tsx
class LoadText extends Action {  
  
  ignoreOld = true
   
  async reduce()  {      
    let response = await fetch("https://dummyjson.com/todos/random/1");        
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;     
    return (state) => state.copy(text: text));
  }   
}
```

In the above example, if the action gets called twice or more before the first one finishes,
only the last one will be considered, and the previous ones will be ignored.

In more detail, the returned state from the reducer will only be applied if the action is the
most recent one dispatched. If it's not, the state will be discarded.

Note that we are not aborting the requests, but simply ignoring the reducer result.
This is fine for most cases.

If we actually want to abort the requests, we need to use
an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal)
by calling `this.getAbortController()` in the action, and then using that controller to
abort the request:

```tsx
class LoadText extends Action {  
  
  ignoreOld = true
   
  async reduce()  {
    let abortController = this.getAbortController(); // Here!    
    
    let response = await fetch("https://dummyjson.com/todos/random/1", {
      signal: abortController.signal, // Here!
    });
            
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;     
    return (state) => state.copy(text: text));
  }   
}
```

Async Redux will automatically abort the previous requests by calling `abortController.abort()`
when a new action is dispatched.
When this happens, the `fetch()` promise will reject with an `AbortError`,
but this error is caught by Async Redux and ignored, so you don't need to worry about it.

If instead of `fetch` you use **Axios**, it also works:

```tsx
let response = await axios.get('https://dummyjson.com/todos/random/1', {
  signal: abortController.signal
});
```

Note: The `ignoreOld` feature is not compatible with the [nonReentrant](#nonreentrant) feature,
because they are opposite concepts. While `nonReentrant` aborts the newer actions
if an older one is running, `ignoreOld` aborts the older actions if a newer one is running.
If you try to use both at the same time, an error will be thrown.

> Important: _this feature is still in development. It should be available soon._

## checkInternet

Adding `checkInternet = { dialog: true }` to your action ensures it only runs with internet,
otherwise an **error dialog** prompts users to check their connection:

```tsx
class LoadPrices extends Action {  
  
  checkInternet = { dialog: true } 
   
  async reduce() { ... } 
}   
```

Use `checkInternet = { dialog: false }` if you don't want to open a dialog.
Instead, you can display some information in your widgets:

```tsx
function MyComponent() {
  const isFailed = useIsFailed(LoadPrices);

  return (
    <div>
      {isFailed ? <p>No Internet connection</p> : null}
    </div>
  );
};   
```

> Important: _this feature is still in development. It should be available soon._

## optimisticUpdate

To provide instant feedback on actions that save information to the server,
this feature immediately applies state changes as if they were already successful,
before confirming with the server.

If the server update fails, the change is rolled back and, optionally,
a notification can inform the user of the issue.

```tsx
class SaveName extends Action {  
  
  optimisticUpdate = { ... } 
   
  async reduce() { ... } 
}
```

> Important: _this feature is still in development. It should be available soon._
