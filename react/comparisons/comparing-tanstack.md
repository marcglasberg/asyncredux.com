---
sidebar_position: 2
---

# Comparing with TanStack Query

TanStack Query is an asynchronous state management package based on queries and caching.

These queries usually fetch data from a server using tools like
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API),
[axios](https://axios-http.com), [ky](https://www.npmjs.com/package/ky)
or [graphql-request](https://www.npmjs.com/package/graphql-request#ignoreoperationname).

## Not only queries

While the original Redux completely ignores async processes, leaving them to middleware
(like thunks), TanStack Query takes the opposite approach, treating all state management as
querying, fetching, and caching.

In my opinion, viewing state management in terms of queries is the **wrong abstraction**.
See here, in
Medium: [What I learned from React-Query, and why I will not use it in my next project](https://medium.com/duda/what-i-learned-from-react-query-and-why-i-will-not-use-it-in-my-next-project-a459f3e91887)

Async Redux manages state through synchronous global state, and actions that can be sync or async.
Actions can query and fetch data, but they also change the state in other ways. Actions can fail or
succeed. You can wait for them to finish, retry them, debounce, throttle them, and do optimistic
updates.

|                           | TanStack Query | Redux Toolkit    | Async Redux         |
|---------------------------|----------------|------------------|---------------------|
| Sync Processes            | No             | Actions/Reducers | Actions/Reducers    |
| Async Processes           | Queries        | Thunks           | Actions/Reducers    |
| Global local state        | No             | Yes              | Yes                 |
| Local Persistence         | No             | Objects          | Objects and Classes |
| Loading and failed states | Yes            | No               | Yes                 |
| Deduplication             | Yes            | No               | Yes                 |
| Smart refetches           | Yes            | No               | Yes (soon)          |
| Retry                     | Yes            | No               | Yes                 |

## Global local state

TanStack Query has a shared cache for all queries. While the cache is technically global sync state,
it's an implementation detail for handling fresh/stale data and is generally not meant for direct
access. That's why the table above says TanStack Query doesn't have "Global local state".

If we want to abuse the cache as local state, we can do something like this:

```tsx
import React from "react";
import { useQuery, queryCache } from "react-query";

function App() {
  return (
    <div>      
      <Component1 />
      <Component2 />
    </div>
  );
}

function useGlobalLocalState(key, initialValue) {
  const { data: state } = useQuery(key, () => queryCache.getQueryData(key), {
    initialData: initialValue
  });

  const setState = value => queryCache.setQueryData(key, value);

  return [state, setState];
}

function Component1() {
  const [count, setCount] = useGlobalLocalState("count", 1);  

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>add</button>
    </div>
  );
}

function Component2() {
  const [count, setCount] = useGlobalLocalState("count", 2);  

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>add</button>
    </div>
  );
}
```

You have to manually manage globally unique keys (like "count" above) to make sure they don't
repeat, and use `initialData`. And you have no type safety when calling `queryClient.setQueryData`.

Async Redux has a global local state that is **meant** for direct access:

```tsx
function App() {
  return (
    <div>      
      <Component1 />
      <Component2 />
    </div>
  );
}

function Component1() {
  const count = useSelect((state) => state.count);  
  const dispatch = useDispatch();  

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(new IncrementCount(count))}>add</button>
    </div>
  );
}

function Component2() {
  const count = useSelect((state) => state.count);  
  const dispatch = useDispatch();  

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(new IncrementCount(count))}>add</button>
    </div>
  );
}
```

## Caching

TanStack Query assumes the server, not the frontend, owns the data.
When your view needs data, you must query it from the cache if it's fresh,
and from the server if it's stale.

In contrast, Async Redux needs no cache, as the local app state contains all information.
It assumes both the frontend and the server own some of the data and helps synchronize them.
When your view needs data, you get it synchronously from the state in memory.
When data is stale, it helps you refetch it, put it in the local app state,
and then use it from there.

TanStack Query has a `staleTime` option to control when data is considered stale and should be
refetched. By default, all cache data is considered stale after 0 seconds, meaning queries will
refetch their data as often as you query them. Async Redux has the same default but uses
the [throttle](../advanced-actions/action-features#throttle) feature,
so each action, not queries, decides if data should be refetched.

Consider an Async Redux action called `LoadText`.
Normally, it would refetch data every time it's dispatched:

```tsx
class LoadText extends Action { 
  reduce() { ... }
}
```

If we add `throttle = 5000`, it will be considered fresh for 5 seconds
and won't run again for that period, even if you dispatch it:

```tsx
class LoadText extends Action {
  throttle = 5000 
  reduce() { ... }
}
```

## Deduplication

TanStack Query deduplicates queries automatically by tracking and sharing promises via
a **query key**.
If a page contains 3 components that show parts of a list queried from the server
with the same query key, only one request will be made.

In Async Redux, this isn't necessary because you get information synchronously from the store.
When you enter the page, it will dispatch an action to fetch the information once
and put it into the store. The 3 components will get their information from the store.

In any case, if you still need to prevent multiple dispatches of some specific action,
you can add [nonReentrant](../advanced-actions/action-features#nonreentrant) to it:

```tsx
class LoadText extends Action { 
  nonReentrant = true;
  reduce() { ... }
}
```

## Debouncing

TanStack Query doesn't currently have debouncing functionality
(or I couldn't find any as of July 2024).
In Async Redux, you can use the [debounce](../advanced-actions/action-features#debounce) feature
to limit how often fetches happen in response to rapid and repeated dispatches.
For example, you can add `debounce = 300` to debounce it for 300 milliseconds:

```tsx
class LoadText extends Action { 
  debounce = 300 
  reduce() { ... }
}
```

## Smart refetches

Both TanStack Query and Async Redux allow refetching stale data.
TanStack Query has options like `refetchOnMount`, `refetchOnWindowFocus`, `refetchOnReconnect`,
`refetchInterval`, and `refetchIntervalInBackground`, which are not yet present in Async Redux but
will be implemented [in the future](https://github.com/marcglasberg/async-redux-react/issues/1).
This is a possible API:

```tsx
let action = new SomeAction(); 

// Start auto dispatching 
useAutoDispatch(new SomeAction(), {
  onMount: true,  
  onWindowFocus: true,
  onReconnect: true,
  onInterval: 5000,
  onIntervalBackground: 30000,
});

// Cancel auto dispatching for a specific action
useAutoDispatch(action, {
  onMount: false,  
  onWindowFocus: false,
  onReconnect: false,
  onInterval: false,
  onIntervalBackground: false,
});

// Cancel auto dispatching for all actions of the given type
useAutoDispatch(SomeAction, {
  onMount: false,  
  onWindowFocus: false,
  onReconnect: false,
  onInterval: false,
  onIntervalBackground: false,
});

// Cancel all auto dispatches for all actions
cancelAutoDispatches();

// Gets a map of all auto dispatches per action
getAutoDispatches();
```

For example, to dispatch action `LoadText` whenever the `TextEditorScreen` component mounts,
but no more than once every 10 seconds:

```tsx
function TextEditorScreen() {
  useAutoDispatch(LoadText, {onMount: true});
  ...
}

class LoadText extends Action { 
  throttle = 10000 
  reduce() { ... }
}
```

## Retry

TanStack Query defaults to silently retrying queries 3 times with exponential backoff before
displaying an error. Async Redux's default is to not retry actions, but you can enable retries
by adding `retry = {on: true}`:

```tsx
class LoadText extends Action { 
  retry = {on: true} 
  reduce() { ... }
}
```

You can specify retry parameters like `initialDelay`, `multiplier`, `maxRetries` and `maxDelay`.
The defaults are [here](../advanced-actions/action-features#retry).

## Loading and failed states

This is how TanStack Query allows a component to know if a query is loading or has failed:

```tsx
function MyComponent() {

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['fetchData'],
    queryFn: fetchData
  });

  if (isLoading) return <div>Loading...</div>;  
  if (isError) return <div>Error: {error.message}</div>;  

  // Rendering the data
  return (
    <div>
      <h1>Data Loaded Successfully</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

This is how Async Redux allows a component to know if a
query [is loading or has failed](http://localhost:3000/react/basics/wait-fail-succeed):

```tsx
function MyComponent() {

  const state = useAllState();     
  const isWaiting = useIsWaiting(LoadText); 
  const isFailed = useIsFailed(LoadText);  
  const error = useExceptionFor(IncrementAction);  
  
  if (isWaiting) return <div>Loading...</div>  
  if (isFailed) return <div>Error: {error.message}</div>;
  
  // Rendering the data
  return (
    <div>
      <h1>Data Loaded Successfully</h1>
      <pre>{state.text}</pre>
    </div>
  );  
}
```

Note TanStack Query couples the component to the query (fetching the information),
while Async Redux doesn't. This means TanStack
Query [doesn't allow](https://chatgpt.com/share/5cd3369e-9993-4f86-b905-0d21b85cbc2f) one
component to know if a query started by **another** component is loading or has failed.

With Async Redux, you can, since `useIsWaiting` and `useIsFailed` work for any component,
regardless of which one dispatched the action.

## Testing

As explained above, TanStack Query couples the component to the query,
while Async Redux **does not** couple the component to the action.
For this reason, testing an app that uses TanStack Query generally involves
testing UI components, which is a lot more complex.

With Async Redux, you can test the actions and reducers directly, without the need for the UI.
Async Redux also provides a lot of features specifically to [help you test](../category/testing)
your actions and reducers. For example:

```ts
// Start with some IBM stocks
var store = Store<State>(initialState: State(portfolio: ['IBM']));

// Buy Tesla stocks  
await dispatchAndWait(new BuyAction('TSLA'));  

// Assert we now have IBM and Tesla
expect(store.state.portfolio).toEqual(['IBM', 'TSLA']);
```

