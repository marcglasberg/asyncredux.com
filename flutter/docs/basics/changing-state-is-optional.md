---
sidebar_position: 6
---

# Changing state is optional

For both sync and async reducers, returning a new state is optional. If you don't plan on changing
the state, simply return `null`. This is the same as returning the state unchanged:

```dart
class GetAmountAction extends ReduxAction<AppState> {
  
  Future<AppState?> reduce() async {    
    int value = await getAmount();
    
    if (value == 0) return null;
    else return state.copy(counter: state.counter + amount));
  }
}
```
    
<br></br>

This is also useful if some action is used to simply start other async processes, or dispatch other
actions. For example:

```dart
class InitAction extends ReduxAction<AppState> {
  
  AppState? reduce() {
    dispatch(ReadDatabaseAction());        
    dispatch(StartTimersAction());          
    dispatch(TurnOnListenersAction());
              
    return null;          
  }
}
```

Note the `reduce()` method has direct access to `dispatch`. 

<hr></hr>

Next, let's see how to reduce boilerplate by defining our own base action class.
