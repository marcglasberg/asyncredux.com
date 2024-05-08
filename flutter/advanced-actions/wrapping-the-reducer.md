---
sidebar_position: 2
---

# Wrapping the reducer

You may wrap the reducer to allow for some pre- or post-processing.

The `wrapReduce()` method gets a reference to the `reducer` method as a parameter.
If you override `wrapReduce()` it's up to you to call the `reducer` and return its result.

It allows you to run some code before and after the reducer runs,
but also to prevent the reducer from running, or to change its result.

## Example

Suppose the app state contains a `name`,
and some action saves a new name to the cloud and then updates the state with it:

```dart
class SaveName extends AppAction {
  final String name;
  SaveName(this.name);      
 
  Future<AppState> reduce() async {
    await saveName(); 
    return state.copy(name: name);
  }
}
```

Saving the name may take some time,
and meanwhile the user may change the name manually.
If that happens, you don't want to overwrite the user's name with the old one.

How can you implement this?

This can be achieved by checking if the `name` changed before and after `saveName()` is
executed. If it changed, you abort the reducer.

One option is implementing this in the reducer itself:

```dart
class SaveName extends AppAction {
  final String name;
  SaveName(this.name);      
 
  Future<AppState> reduce() async {    
    var previousName = state.name; 
    await saveName(); 
    var currentName = state.name;    
    
    return (previousName == currentName)
        ? state.copy(name: name)
        : null;
  }
}
```

Another option is wrapping the reducer like this:

```dart
class SaveName extends AppAction {
  final String name;
  SaveName(this.name);      

  Reducer<St> wrapReduce(Reducer<St> reduce) => () async {
    var previousState = state.name; 
    AppState? newState = await reduce();  
    return identical(previousState, state.name) ? newState : null;
  }

  Future<AppState> reduce() async {       
    await saveName();            
    return state.copy(name: name);
  }
}
```

### Creating a Mixin

You may also create a mixin to make it easier to add this behavior to multiple actions:

```dart
mixin AbortIfStateChanged on AppAction {
  
  abstract AppState getObservedState();
  
  Reducer<St> wrapReduce(Reducer<St> reduce) => () async {
    var previousState = getObservedState(); 
    AppState? newState = await reduce();  
    return identical(previousState, getObservedState()) ? newState : null;
  }
}
```

Which allows you to write `with AbortIfStateChanged`:

```dart
class SaveName extends AppAction with AbortIfStateChanged {
  final String name;
  SaveName(this.name);      
  
  AppState getObservedState() => state.name;

  Future<AppState> reduce() async {       
    await saveName();            
    return state.copy(name: name);
  }
}
```
