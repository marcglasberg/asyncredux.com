---
sidebar_position: 3
---

# Advanced view model

We have already discussed how to create the `ViewModel` using the `vm` parameter.

This page will discuss some advanced topics related to the `ViewModel`.
Note you don't need to know the information on this page to use Async Redux.
But keep reading if you want to know everything there is to know about the `ViewModel`
and its edge cases.

## State and CurrentState

As discussed, the factories you create should extend `VmFactory`
and implement its `fromStore()` method.

From your factory instance, you can access both `state` and `currentState()`.
The difference between them is subtle, but important:

* `state` getter: The state the store was holding when the factory and the view-model were
  created. This state is final inside the factory.

* `currentState()` method: The current (most recent) store state. This will return the current
  state the store holds at the time the method is called.

These values are usually the same, because when the `state` changes, the view-model is
rebuilt, assuring that `currentState()` will be the same as `state`. But there are
edge cases where they can be different, usually when you are using callbacks.

For example:

```dart
class Factory extends VmFactory<AppState, MyConnector, ViewModel> {
          
    ViewModel fromStore() => ViewModel(                
        onIncrement: () {
        
          // Prints 1/1
          print(state.counter + '/' + currentState().counter);
          
          dispatchSync(IncrementAction());
          
          // Prints 1/2
          print(state.counter + '/' + currentState().counter);
        }  
    );
}
```

# The factory uses the widget

You usually pass a reference to the connector widget into the factory constructor, like this:

```dart    
vm: () => Factory(this),
```

In the factory, you can then access the connector widget using the `connector` field.

That's generally useful when the factory needs to access the fields of the connector widget.
For example, consider this `UserAvatarConnector` widget:

```dart
class UserAvatarConnector extends StatelessWidget {
  final User user;
  UserAvatarConnector(this.user);    
  
  Widget build(BuildContext context) {
    return StoreConnector(
      vm: () => Factory(this),
      builder: (...) => UserAvatar(...)
  }	  
}  
```

In the factory, you can access the `user` field of the connector widget:

```dart
class Factory extends VmFactory<AppState, MyHomePageConnector, ViewModel> {
  Factory(connector) : super(connector);

  ViewModel fromStore() => ViewModel(
    name: connector.user.name,             
    age: state.users.getAge(connector.user),             
  );
}
```

# The factory uses the view-model

As discussed, the factory creates the view-model.
However, once the view-model is created, you can already reference the view-model inside the
Factory methods, through the `vm` getter.

That's generally useful for callbacks, to avoid recalculating the view-model fields.

For example, consider this factory:

```dart
ViewModel fromStore() => ViewModel(

   user: state.users.getById(connector.userId),
   
   onDelete: () {
     var user = state.users.getById(connector.userId);
     dispatch(DeleteUserAction(user)),
  }   
}  
```

As you can see above, the `onDelete` callback recalculates the user from the state, even though
the user is already available in the view-model.

To avoid recalculating information that is already present in the view-model,
you can use the `vm` getter:

```dart
ViewModel fromStore() => ViewModel(
   user: state.users.getById(connector.userId),
   onDelete: _onDelete,
);      
  
VoidCallback _onDelete: () 
  => dispatch(DeleteUserAction(vm.user)), // Here!
```            

Please note, you can only use the `vm` getter after the `fromStore()` method returns,
which means you cannot use it when the `fromStore()` method is running. If you do that,
you'll get a `StoreException`.

The reason you can use it in callbacks, is because the view-model is already created
when callbacks are called later on by the dumb widget.

## Subclassing `VmFactory`

Just like you can create a base action called `AppAction` that extends `ReduxAction<AppState>`,
you can also create a `BaseFactory` that extends `VmFactory`.

This is useful to:

* Reduce boilerplate, and not having to pass the `AppState` type parameter whenever you
  create a Factory.

* Provide additional features to your model, like adding extra getters to help you access state.

Example:

```dart       
abstract class BaseFactory<T extends Widget?, Model extends Vm> extends VmFactory<AppState, T, Model> {      
    BaseFactory([T? connector]) : super(connector);
     
    User get user => state.user;        
}
```

This allows you to create factories that extend `BaseFactory`:

```dart
class Factory extends BaseFactory {
 
  ViewModel fromStore() => ViewModel(
    name: user.name, // Instead of `name: state.user.name`       
  );                                    
}
```   
