---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Persisting the state

Finally, let's add a **persistor** to save the state to the local device disk.
This is done during the store creation:

```tsx          
const store = createStore<State>({  
  initialState: State.initialState,
  showUserException: userExceptionDialog,
  persistor: persistor, // Here!
});        
```

You can implement your own persistor, as long as it follows the abstract `Persistor` interface,
provided by Async Redux.

Adding a persistor allows the user to reload the page,
or close the browser and reopen it later, without losing the todo list.

## ClassPersistor

Async Redux comes out of the box with the `ClassPersistor` that implements the `Persistor`
interface. It serializes ES6 classes out of the box,
and it will persist the whole state of your application.

To use it, you must provide:

* `loadSerialized`: a function that returns the serialized state.
* `saveSerialized`: a function that saves the serialized state.
* `deleteSerialized`: a function that deletes the serialized state.
* `classesToSerialize`: an array of all the _custom_ classes that are part of your state.

In more detail, here's the `ClassPersistor` constructor signature:

```tsx
constructor(

  // Returns the serialized state.
  // It should return a Promise that resolves to the serialized state, 
  // or to null if the state is not yet persisted.
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

For our _Todo List_ app, this is the complete code:

<Tabs>
<TabItem value="rw" label="Flutter">

```tsx 
let persistor = new ClassPersistor<State>(

  // loadSerialized
  async () => window.localStorage.getItem('state'),
  
  // saveSerialized
  async (serialized: string) => window.localStorage.setItem('state', serialized),
  
  // deleteSerialized
  async () => window.localStorage.clear(),
  
  // classesToSerialize
  [State, TodoList, TodoItem, Filter]
);
```

</TabItem>
<TabItem value="rn" label="Flutter Native">

```tsx
let persistor = new ClassPersistor<State>(

  // loadSerialized
  async () => await AsyncStorage.getItem('state'),
  
  // saveSerialized
  async (serialized) => await AsyncStorage.setItem('state', serialized),
  
  // deleteSerialized
  async () => await AsyncStorage.clear(),
  
  // classesToSerialize
  [State, TodoList, TodoItem, Filter] 
);
```

</TabItem>
</Tabs>

<br></br>

## Try it yourself

Add some items to the list, mark some of them as completed, and then **reload the page**.
You should see the same items and their completed status.

<iframe
src="https://codesandbox.io/embed/sw3g2t?view=split&module=%2Fsrc%2FApp.dart&hidenavigation=1&fontsize=12.5&editorsize=50&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '650px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## Implementing your own serializer

If instead of using the provided `ClassSerialized` you decide to implement your own 
serializer, the following information may be useful for you.

In JavaScript there are two types of objects:

* Plain (literal) objects - Instances of the `Object` class.
  Sometimes they are called literal objects, when created via the `{}` notation.

* Class (constructor) objects - Instances of classes with own defined constructor,
  properties and methods. Usually you define them via class notation.

If you are loading a JSON from your backend, after you `JSON.parse()` it,
you have a plain JavaScript object, not an instance of a class.

These packages will help you transform plain JavaScript objects into ES6 classes: 

* [esserializer](https://www.npmjs.com/package/esserializer) - This is the package used internally
  by the `ClassSerialized`. ESSerializer is a JavaScript serialization and deserialization utility,
  that helps you serialize classes to JSON, and then deserialize them back to class objects,
  with all properties and methods, recursively. No eval is used, which means it doesn't introduce
  any security risks.

* [class-transformer](https://www.npmjs.com/package/class-transformer) - Allows you to transform
  plain JavaScript objects into some class object and versa, and also serialize and deserialize
  them.  

