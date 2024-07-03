---
sidebar_position: 5
---

# Changing state is optional

For both sync and async reducers, returning a new state is optional. If you don't plan on changing
the state, simply return `null`. This is the same as returning the state unchanged:

```ts
class GetAmount extends Action {
  
  reduce() async {    
    let amount = await getAmount();
    
    if (amount == 0) 
      return null;
    else 
      return (state) => state.copy({counter: state.counter + amount}));
  }
}
```

This also works:

```ts
class GetAmount extends Action {
  
  reduce() async {    
    let amount = await getAmount();
    
    return (state) => 
      (amount == 0) 
        ? null
        : state.copy({counter: state.counter + amount}));        
  }
}
```
   
<br></br>

Returning `null` is also useful when your action should not change the state, 
but simply start other async processes, or [dispatch](./dispatching-actions) other actions. For example:

```ts
class Initialize extends Action {
  
  reduce() {
    this.dispatch(new ReadDatabaseAction());        
    this.dispatch(new StartTimersAction());          
    this.dispatch(new TurnOnListenersAction());
              
    return null;          
  }
}
```

Note the `reduce()` method has direct access to `dispatch`. 

<hr></hr>

Next, let's see how to dispatch actions.
