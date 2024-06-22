---
sidebar_position: 12
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

You must be set up your persistor during the store creation.

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
This interface is shown below, with its four methods that must be
implemented: `readState`, `deleteState`, `persistDifference` and `saveInitialState`.

Read the comments in the code below to understand what each method should do.

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

Async Redux will call these methods at the right time, so you don't need to worry about it:

* When the app opens, Async Redux will call `readState` to get the last state that was persisted.

* In case there is no persisted, state yet (first time the app is opened), the `saveInitialState`
  function will be called to persist the initial state.

* In case there is a persisted state, but it's corrupted (reading the state fails with an error),
  then `deleteState` will be called first to delete the corrupted state,
  and then `saveInitialState` will be called to persist the initial state.

* In case the persisted state read with `readState` is valid, this will become the current store
  state.

* From this moment on, every time the state changes, Async Redux will schedule a call to
  the `persistDifference` function. This function will not be called more than once each 2 seconds,
  which is the default throttle interval. You can change it by overriding the `throttle` property.

* In the unlikely case the `persistDifference` function itself takes more than 2 seconds to execute,
  the next call will be scheduled only after the current one finishes.

* The `persistDifference` function receives the last persisted state and the current new state.
  The simplest way to implement this function is to ignore the `lastPersistedState` parameter,
  and persist the whole `newState` every time. This is fine for small states, but for larger states
  you can compare the two states and persist only the difference between them.

## ClassPersistor

Async Redux comes out of the box with the `ClassPersistor` that implements the `Persistor`
interface. It supports serializing both JavaScript objects and ES6 classes out of the box,
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

As explained, the `ClassPersistor` supports serializing both JavaScript objects and ES6 classes.
However, if you have classes in the state, you will need to list them all in
the `classesToSerialize` parameter above.

For example, consider the _Todo List_ app shown below,
which was created in our [tutorial](./category/tutorial).
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

