---
sidebar_position: 3
---

# Mocking actions 

Mocks should be used for **testing** purposes, only.

You can mock actions to return specific states, to throw specific errors, 
or even to abort the action dispatch.

## mocks.add

By adding mocks to the store,
whenever an action is dispatched, 
Async Redux will check if there is a mock for the action's **type**.
If there is, the corresponding **mock function** will be called
to return a **mock action** that will be dispatched instead.

```ts
store.mocks.add(actionType, (action) => mockAction);
```

The action type to be mocked is set in parameter `actionType` shown above.
The mock function is given as `(action) => mockAction`. It will be called to return a `mockAction`.

However, if `mockAction` is `null` the action will be aborted:
it will not dispatch, and will not change the state or throw any errors.

Let's see a few examples:
                  
**Mocking an action with another action**

```ts
// When IncrementAction() is dispatched, 
// action AddAction(1) will be dispatched instead.
store.mocks.add(IncrementAction, (action) => new AddAction(1));
```  

<br></br>
**Changing an action's value**

```ts
// When an AddAction(value) is dispatched, instead  
// of adding, the value will be subtracted instead.
store.mocks.add(AddAction, (action) => new AddAction(-action.value));
```  

<br></br>
**Aborting an action**

```ts
// When LoadUserAction() is dispatched, it will be aborted.
store.mocks.add(LoadUserAction, null);
```  

<br></br>
**Counting actions**

```ts
let count = 0;
store.mocks.add(IncrementAction, (action) => {
  count++;
  return action;
});

store.dispatch(new IncrementAction());
store.dispatch(new IncrementAction());  

// Assert the number of times IncrementAction() is dispatched.
expect(count).toBe(2);
```  

<br></br>
**Recording action values**

```ts
let values = [];

store.mocks.add(AddAction, (action) => {
  values.push(action.value);
  return action;
});
                       
store.dispatch(new AddAction(2));
store.dispatch(new AddAction(9));
store.dispatch(new AddAction(5));

// Assert the values of all AddAction's dispatched.
expect(values).toEqual([2, 9, 5]);     
```

<br></br>
**Recording dispatched action types**

```ts
let types = [];

store.mocks.add('*', (action) => {
    types.push(action.constructor.name);
    return action;
});

store.dispatch(new AddAction(2));
store.dispatch(new IncrementAction(9));
store.dispatch(new LoadUserAction());

// Assert the action types dispatched.
expect(types).toEqual([
  'AddAction', 
  'IncrementAction', 
  'LoadUserAction'
]);
```

## mocks.remove

Removes the mock for the given action type, from the store.
If the action type is not mocked, the removal will be ignored (will not throw an error).

```ts 
// Removes the mock for the IncrementAction.
store.mocks.remove(IncrementAction);
```

## mocks.clear

Removes all mocks, if any.

```ts 
store.mocks.clear();
```   
