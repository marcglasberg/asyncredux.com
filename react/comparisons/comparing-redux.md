---
sidebar_position: 1
---

# Comparing with Redux Toolkit

The original Redux has been criticized for having large amounts of boilerplate, to the point of
being [unrecommended by its main author](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367):

> If you’re just learning React, don’t make Redux your first choice.

Redux Toolkit was created to make it easier to write Redux applications,
but it still forces you into a lot of boilerplate, and forces you to use middleware
to handle async processes, through the
hard-to-use [redux-thunk](https://www.npmjs.com/package/redux-thunk) or RTK Query.

On the contrary, Async Redux can and should be used even for simple apps,
and it can be the first choice for people just learning React,
as it's so simple to understand and use. And if one day your app needs to scale,
Async Redux will support it.

Async Redux has common goals with Redux:

* Being predictable
* Helping write applications that behave consistently
* Centralizing the application state and logic
* Allowing easy debugging

But Async Redux is easy to use.
It has none of the boilerplate of the original Redux and Redux Toolkit.
It has no code in common with the vanilla Redux core,
and was completely rewritten with simplicity in mind and eliminating boilerplate.

Let's see some code comparisons.

<hr></hr>

## Wiring reducers to the store

* With Redux Toolkit you need to use `configureStore` to create a store, and you need to pass
  a `reducer` object to wire up all the reducers to the store (see the necessary code above),
  at the same time when you add middleware and enhancers:

  ```ts title="Redux Toolkit"
  import todosReducer from './todos/todosReducer'
  import visibilityReducer from './visibility/visibilityReducer'
  
  const reducer = {
    todos: todosReducer,
    visibility: visibilityReducer,
  }
  
  const debounceNotify = _.debounce((notify) => notify())
  
  const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        thunk: {
          extraArgument: myCustomApiService,
        },
        serializableCheck: false,
      }).concat(logger),  
    preloadedState,
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers({
        autoBatch: false,
      }).concat(batchedSubscribe(debounceNotify)),
  })
  ```

* With Async Redux you don't need to list any reducers when creating the store.
  The store doesn't need to know about reducers and actions in advance.
  This is the equivalent Async Redux code:

  ```ts title="Async Redux"
  const store = createStore({
    initialState: State.initialState
  });
  ```

## Creating actions and reducers

* With Redux Toolkit you need to use [createReducer](https://redux-toolkit.js.org/api/createReducer)
  and [createAction](https://redux-toolkit.js.org/api/createAction) to create the actions,
  the reducer functions, and then wire them up to the store:

  ```ts title="Redux Toolkit"   
  const increment = createAction<number>('increment')
  const decrement = createAction<number>('decrement')
  
  function isActionWithNumberPayload(
    action: UnknownAction
  ): action is PayloadAction<number> {
    return typeof action.payload === 'number'
  }
  
  const reducer = createReducer(
    {
      counter: 0,
      sumOfNumberPayloads: 0,
      unhandledActions: 0,
    },
    (builder) => {
      builder
        .addCase(increment, (state, action) => {
          // action is inferred correctly here
          state.counter += action.payload
        })
        // You can chain calls, or have separate `builder.addCase()` lines each time
        .addCase(decrement, (state, action) => {
          state.counter -= action.payload
        })
        // You can apply a "matcher function" to incoming actions
        .addMatcher(isActionWithNumberPayload, (state, action) => {})
        // and provide a default case if no other handlers matched
        .addDefaultCase((state, action) => {})
    }
  )
  ```

* With Async Redux, by simply dispatching actions, those actions have their own reducers.  
  When you need to add a new action, just create the action with its reducer, and dispatch it.
  For example, to create actions `Increment` and `Decrement`, this is all the necessary code:

  ```ts title="Async Redux"  
  class Increment extends Action {
    constructor(readonly value: number) { super(); }    
    reduce() { return this.state.add(this.value); }
  }

  class Decrement extends Action {
    constructor(readonly value: number) { super(); }    
    reduce() { return this.state.add(-this.value); }
  }
  ``` 

## Thunk middleware

* With Redux Toolkit you need to use `configureStore` to create a store, and you need to pass
  the `middleware` that uses thunks to create async processes.
  Thunks [are very complex](https://redux-toolkit.js.org/api/createAsyncThunk).
  This is some code to fetch a user by id:

  ```ts title="Redux Toolkit"
  // First, create the thunk
  const fetchUserById = createAsyncThunk(
    'users/fetchByIdStatus',
    async (userId: number, thunkAPI) => {
      const response = await userAPI.fetchById(userId)
      return response.data
    },
  )
  
  interface UsersState {
    entities: User[]
    loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  }
  
  const initialState = {
    entities: [],
    loading: 'idle',
  } satisfies UserState as UsersState
  
  // Then, handle actions in your reducers:
  const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
      // standard reducer logic, with auto-generated action types per reducer
    },
    extraReducers: (builder) => {
      // Add reducers for additional action types here, and handle loading state as needed
      builder.addCase(fetchUserById.fulfilled, (state, action) => {
        // Add user to the state array
        state.entities.push(action.payload)
      })
    },
  })    
  ```

* With Async Redux you just don't need middleware thunks or sagas. Your actions can be async,
  which means you can use `async` and `await` in your actions, and they will work as expected.
  This is the equivalent code:

  ```ts title="Async Redux"
  class FetchUserById extends Action {
    constructor(readonly userId: number) { super(); }
      
    async reduce() {
      const response = await userAPI.fetchById(userId)
      return state.entities.withAdded(response.data); 
    }
  }
  ```

## Other middleware

* With Redux Toolkit you may also include middleware to check if the state is
  (i) serializable and does not contain classes;
  (ii) immutable; and
  (iii) to identify when an action creator was mistakenly dispatched without being called.

* With Async Redux you doesn't need these middleware, because those problems are solved by design:
  (i) Async Redux can serialize classes just fine;
  (ii) By creating the state as explained in the [Tutorial](../tutorial/creating-the-state)
  section, immutability becomes trivial, and
  (iii) You can't mistakenly dispatch an action creator without calling it, because the dispatch
  function only accepts the correct action type.

## RTK Query

* With Redux Toolkit you need to use [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
  (similar to TanStack Query) to achieve things like
  (i) Tracking loading state in order to show UI spinners;
  (ii) Avoiding duplicate requests for the same data;
  (iii) Optimistic updates to make the UI feel faster; and
  (iv) Managing cache lifetimes as the user interacts with the UI.

* With Async Redux, to show spinners and error messages you can simply
  use [useIsWaiting](../tutorial/async-actions#adding-a-spinner)
  and [useIsFailed](../tutorial/async-actions#combining-iswaiting-and-isfailed):

  ```ts title="Async Redux"
  let isLoading = useIsWaiting(SomeAction);
  let isFailed = useIsFailed(SomeAction);
  let errorText = useExceptionFor(SomeAction).errorText;

  <div>
    <button
        onClick={() => store.dispatch(new SomeAction())}
        disabled={isLoading}
        { isLoading ? 'Loading...' : 'Do Something' }
    </button>
    {isFailed && <div>{errorText}</div>}
  </div>
  ```

And to avoid duplicate requests, do optimistic updates, manage cache lifetimes,
debounce or throttle requests,
you can use [action features](../advanced-actions/action-features).
See the [comparison with TanStack Query](./comparing-tanstack) for more information.

<hr></hr>

## Is Async Redux really Redux?

Let's recap
the [three principles](https://redux.js.org/understanding/thinking-in-redux/three-principles) of
Redux:

* **Single source of truth**: The state of the entire application is stored in a single object tree
  within a single store. This makes it easier to track changes over time and debug the application.

* **State is read-only**: The state is immutable and can only be changed by dispatching an action to
  the store.

* **Changes are made with pure functions**:
  A reducer is a pure function that takes the previous state and an action, and returns the next
  state. The action specifies what occurred, and the reducer's role is to return the updated state
  as a result of that action.

The controversial principle here is the third one.
Reducers, which describe the logic for handling changes, should be pure functions.
However, since real apps also need to account for async processes,
this forces you to also use middleware like thunks, which are not pure functions.

In Async Redux, **sync actions** can also have reducers that are pure functions. For example:

```ts   
class AddValue extends Action {
  constructor(readonly value: number) { super(); }    
  reduce() { return this.state.add(this.value); }
}
```

But **async actions** have reducers with two parts.
The initial part can do async work, equivalent to a thunk,
and the final "return" part can still be a pure function:

```ts   
class LoadText extends Action {
      
  async reduce() {

    // This is the async code, equivalent to a thunk.
    let text = await loadText();  
    
    // This is the pure function part,
    // equivalent to the original Redux reducer. 
    return (state) => this.state.withText(text);  
  }
}
```

If you define Async Redux reducer as being composed of a middleware plus the pure function,
then you are back to the original Redux principles, just written in a different way.

How about the face that Async Redux puts reducers inside actions?
Doesn't this couple “what happened” (the action) to “how things change” (the reducer)?

Not really. When you dispatch an action, you don't need to know how the reducer will handle it:

```ts
// You specify the action `AddValue` with payload `42`,
// but you don't need to know how the reducer will handle this.
dispatch(new AddValue(42));
```

All the following features listed by Dan
Abramov [here](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367) are
equally present in Async Redux:

* Persist state to a local storage and then boot up from it, out of the box.
* Pre-fill state on the server, send it to the client in HTML, and boot up from it, out of the box.
* Serialize user actions and attach them, together with a state snapshot, to automated bug reports,
  so that the product developers can replay them to reproduce the errors.
* Pass action objects over the network to implement collaborative environments without dramatic
  changes to how the code is written.
* Maintain an undo history or implement optimistic mutations without dramatic changes to how the
  code is written.
* Travel between the state history in development, and re-evaluate the current state from the action
  history when the code changes, a la TDD.
* Provide full inspection and control capabilities to the development tooling so that product
  developers can build custom tools for their apps.
* Provide alternative UIs while reusing most of the business logic.

However, when you are creating the code, understanding it, or debugging,
you can easily navigate from the action to the reducer it affects, with a simple click in your IDE.

After reading this explanation most people agree with me that Async Redux is Redux.
But if you happen that disagree, that's fine, as this is not really important.

The important thing, the feature that I like the most about Redux,
and that Async Redux replicates, is that it's extremely predictable.

In the last few years of using Async Redux in production,
me and the developers in my team never encountered a situation
where I didn't understand what was happening.
The code is very clear to read, I can always predict what will happen when I dispatch an action,
and if there's a bug, I can always find it quickly.

Give it a try and [follow the tutorial](../tutorial/setting-up-the-store).


