---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Persistor

The **persistor** allows you to save the store state to the local device disk.

- In the **web**, it allows the user to reload the page,
  or close the browser and reopen it later, without losing the previous state.

- In **React Native**, it allows the user to kill the app and reopen it later,
  without losing the previous state.

## Setup

You must set up your persistor during the store creation:

```tsx          
const store = createStore<State>({  
  initialState: ...  
  persistor: persistor, // Here!
});        
```

Let's first see how to implement your own persistor,
and then let's see how to use the `ClassPersistor` that comes out of the box with Async Redux.

## Implementation

All a persistor needs to do is to implement the abstract `Persistor` interface.
This interface is shown below, with its four functions that must be
implemented: `readState`, `deleteState`, `persistDifference` and `saveInitialState`.

Read the comments in the code below to understand what each function should do.

```tsx
export abstract class Persistor<St> {
 
  // Function `readState` should read/load the saved state from the 
  // persistence. It will be called only once per run, when the app  
  // starts, during the store creation.
  //
  // - If the state is not yet saved (first app run), `readState`  
  //   should return `null`.
  //  
  // - If the saved state is valid, `readState` should return the 
  //   saved state.
  //
  // - If the saved state is corrupted but can be fixed, `readState`   
  //   should save the fixed state and then return it.
  //
  // - If the saved state is corrupted and cannot be fixed, or some  
  //   other serious error occurs while reading the state, `readState`   
  //   should thrown an error, with an appropriate error message.
  //
  // Note: If an error is thrown by `readState`, Async Redux will log  
  // it with `Store.log()`. 
  abstract readState(): Promise<St | null>;

  // Function `deleteState` should delete/remove the saved state from 
  // the persistence.    
  abstract deleteState(): Promise<void>;

  // Function `persistDifference` should save the new state to the 
  // persistence, and return a `Promise` that completes only after 
  // it is persisted.
  //
  // This new state is provided to the function as a parameter 
  // called `newState`. For simpler apps where your state is small, 
  // you can simply persist the whole `newState` every time. 
  //
  // But for larger apps, you may compare it with the last persisted state, 
  // and persist only the difference between them. The last persisted state 
  // is provided to the function as a parameter called `lastPersistedState`. 
  // It may be `null` if there is no persisted state yet (first app run).  
  abstract persistDifference(
    lastPersistedState: St | null,
    newState: St
  ): Promise<void>;

  // Function `saveInitialState` should save the given `state` to the 
  // persistence, replacing any previous state that was saved.  
  abstract saveInitialState(state: St): Promise<void>;

  // The default throttle is 2 seconds (2000 milliseconds). 
  // Return `null` to turn off the throttle.   
  get throttle(): number | null {
    return 2000; 
  }
}
```

Async Redux will call these functions at the right time, so you don't need to worry about it:

* When the app opens, Async Redux will call `readState()` to get the last state that was persisted.

* In case there is no persisted, state yet (first time the app is opened), the `saveInitialState()`
  function will be called to persist the initial state.

* In case there is a persisted state, but it's corrupted (reading the state fails with an error),
  then `deleteState()` will be called first to delete the corrupted state,
  and then `saveInitialState()` will be called to persist the initial state.

* In case the persisted state read with `readState()` is valid, this will become the current store
  state.

* From this moment on, every time the state changes, Async Redux will schedule a call to
  the `persistDifference()` function. This function will not be called more than once each 2
  seconds, which is the default throttle interval. You can change it by overriding the `throttle`
  property (make it zero if you want no throttle, and the state will save as soon as it changes).

* In the unlikely case the `persistDifference()` function itself takes more than 2 seconds to
  execute, the next call will be scheduled only after the current one finishes.

* The `persistDifference()` function receives the last persisted state and the current new state.
  The simplest way to implement this function is to ignore the `lastPersistedState` parameter,
  and persist the whole `newState` every time. This is fine for small states, but for larger
  states you can compare the two states and persist only the difference between them.

* Even if you have a non-zero throttle period, sometimes you may want to save the state immediately,
  for some reason. You can do that by dispatching the built-in `PersistAction`
  with `dispatch(new PersistAction());`. This will ignore the throttle period and
  call `persistDifference()` right away to save the current state.

## ClassPersistor

Async Redux comes out of the box with the `ClassPersistor` that implements the `Persistor`
interface. It supports serializing ES6 classes out of the box,
and it will persist the whole state of your application.

To use it, you must provide these function:

* `loadSerialized`: a function that returns the serialized state.
* `saveSerialized`: a function that saves the serialized state.
* `deleteSerialized`: a function that deletes the serialized state.
* `classesToSerialize`: an array of all the _custom_ classes that are part of your state.

In more detail, here's the `ClassPersistor` constructor signature:

```tsx
constructor(

  // Returns the serialized state.
  // It should return a Promise that resolves to the saved serialized 
  // state, or to null if the state is not yet persisted.
  public loadSerialized: () => Promise<string | null>,
    
  // Saves the given serialized state. 
  // It should return a Promise that resolves when the state is saved.    
  public saveSerialized: (serialized: string) => Promise<void>,
    
  // Deletes the serialized state. 
  // It should return a Promise that resolves when the state is deleted.
  public deleteSerialized: () => Promise<void>,
    
  // List here all the custom classes that are part of your state, directly 
  // or indirectly. Note: You don't need to list native JavaScript classes. 
  public classesToSerialize: Array<ClassOrEnum>
)
```

<br></br>

Here is the simplest possible persistor declaration that uses the `ClassPersistor`.
It uses `window.localStorage` for React web, and `AsyncStorage` for React Native:

<Tabs>
<TabItem value="rw" label="React">

```tsx 
let persistor = new ClassPersistor<State>(

  // loadSerialized
  async () => window.localStorage.getItem('state'),
  
  // saveSerialized
  async (serialized: string) => window.localStorage.setItem('state', serialized),
  
  // deleteSerialized
  async () => window.localStorage.clear(),
  
  // classesToSerialize
  []
);
```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx
let persistor = new ClassPersistor<State>(

  // loadSerialized
  async () => await AsyncStorage.getItem('state'),
  
  // saveSerialized
  async (serialized) => await AsyncStorage.setItem('state', serialized),
  
  // deleteSerialized
  async () => await AsyncStorage.clear(),
  
  // classesToSerialize
  [] 
);
```

</TabItem>
</Tabs>

As explained, the `ClassPersistor` supports serializing ES6 classes.
However, you will need to list all class types in the `classesToSerialize` parameter above.

For example, consider the _Todo List_ app shown below,
which was created in our [tutorial](../category/tutorial).
It uses classes called `State`, `TodoList`, `TodoItem`, and `Filter` in its state.
This means that you must list them all in the `classesToSerialize` parameter of
the `ClassPersistor`:

```tsx
// classesToSerialize
[State, TodoList, TodoItem, Filter]
```

To see the persistence in action,
try adding some items to the todo list below, and then reload the page.
You should see those items surviving the reload.

<iframe
src="https://codesandbox.io/embed/sw3g2t?view=preview&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=50&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '500px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## App lifecycle

In mobile apps, you have to understand the app lifecycle to use the persistor correctly:

* Foreground: The app is active and running, and is visible to the user.
* Background: The app is running but is not visible to the user, usually because the user has
  switched to another app or returned to the home screen.
* Inactive: The app is transitioning between states, such as when an incoming call occurs, but the
  user has not yet decided whether to accept or reject the call.
* Terminated: The app was killed, and is not running. It can be explicitly terminated by the user
  or the system.

When the app goes to the **background**, you may want to call `store.pausePersistor()`
to **pause** the persistor, and then **resume** it by calling `store.resumePersistor()`
when the app comes back to the **foreground** .

However, when the app is **terminated**, it's a different story.
In this case, you must force the persistor to save the state immediately.
This is necessary because a throttle of a few seconds was probably defined for the persistor.
For example, suppose the throttle is 2 seconds (the default),
but the app is killed 1 second after the last save.

In this case, all state changes for the last second will be lost.
To avoid this, as soon as you detect that the app is about to be killed,
you should call `store.persistAndPausePersistor()` to save the state immediately,
and then pause the persistor.

## Log out

When your user logs out of your app, or deletes its user account,
you want to go back to the login page, and allow another user to log in,
or start a new sign-up process.

To that end, you need to delete the persisted state, and return the store
state to its initial-state.

You may be temped to write `dispatch(new UpdateStateAction((state: State) => initialState));`
but that's not so simple. The persistor may be waiting for the throttle period, some async
actions may still be running, etc. Thankfully, Async Redux provides you with a `store.signOut()`
function that you can call to perform this process safely.

This is how you can do it:

```ts
await store.logOut({
  initialState: State.initialState,
  throttle = 3000,
  actionsThrottle = 6000,
})
```  

When this function returns, your initial store state will be restored to its initial state.

Defining `throttle` and `actionsThrottle` above is optional, because
the default `throttle` is 3 seconds, and the default `actionsThrottle` is 6 seconds.
This is how `signOut()` uses them:

- Waits for `throttle` milliseconds to make sure all async processes that the app may
  have started have time to finish.

- Waits for all actions currently running to finish, but wait at most `actionsThrottle`
  milliseconds. If the actions are not finished by then, the state will be deleted anyway.

:::warning

If you know about any timers or async processes that you may have started, you should stop/cancel
them all **before** calling the `logOut()` function.

Also, it's up to you to redirect the user to the login page after `logOut()` returns.

:::

## Manually accessing the persistor

The functions below are probably only useful for **testing** the persistence of your app.
Only use them in production if you know exactly what you're doing,
and you have a very good reason to do so.

As explained above, when you create the persistor you add it to the store:

```tsx          
const store = createStore<State>({  
  initialState: ...  
  persistor: persistor, 
});        
```

After this, you should **not** keep a reference to the persistor,
and should not call any of the persistor functions.

Since Async Redux is managing the persistor, calling the persistor functions directly
may disrupt the delicate process of keeping track of state changes.

However, you can still use the persistor **indirectly** through the store:

* `saveInitialStateInPersistence(initialState)` asks the Persistor to save the
  given `initialState` to the local device disk.

* `readStateFromPersistence` asks the Persistor to read the state from the local device disk.
  If you use this function, you **must** yourself put this state into the store.
  Async Redux will assume that's the case, and will not work properly otherwise.

* `deleteStateFromPersistence()` asks the Persistor to delete the saved state from the local
  device disk.

* `getLastPersistedStateFromPersistor()` gets the last state that was saved by the Persistor.

