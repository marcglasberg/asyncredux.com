---
sidebar_position: 13
---

# ViewModel

How to provide the ViewModel to the StoreConnector?

The `StoreConnector` actually accepts two parameters for the `ViewModel`, of which **only one**
should be provided in the `StoreConnector` constructor: `vm` or `converter`.

1. the `vm` parameter

   Most examples in the [example tab](https://pub.dartlang.org/packages/async_redux#-example-tab-)
   use the `vm` parameter.

   The `vm` parameter expects a function that creates a `Factory` object that extends
   `VmFactory`. This class should implement a method `fromStore` that returns a `ViewModel`
   that extends `Vm`:

   ```dart
   @override
     Widget build(BuildContext context) {
       return StoreConnector<int, ViewModel>(
         vm: () => Factory(),
         builder: (BuildContext context, ViewModel vm) => MyWidget(...),
       );
     }
   ```   

   AsyncRedux will automatically inject `state`, `currentState()` and `dispatch()` into your model
   instance, so that boilerplate is reduced in your `fromStore` method. For example:

   ```dart
   class Factory extends VmFactory<AppState, MyHomePageConnector, ViewModel> {
              
        @override
        ViewModel fromStore() => ViewModel(
            counter: state.counter,
            description: state.description,
            onIncrement: () => dispatch(IncrementAndGetDescriptionAction()),
            );
   }
   ```     

   **Note:**

  * `state` getter: The state the store was holding when the factory and the view-model were
    created. This state is final inside the factory.

  * `currentState()` method: The current (most recent) store state. This will return the current
    state the store holds at the time the method is called.

   <br></br>

   If you need it, you may pass the connector widget to the factory's constructor, like this:

   ```dart    
   vm: () => Factory(this),
   
   ...
   
   class Factory extends VmFactory<AppState, MyHomePageConnector, ViewModel> {
      Factory(connector) : super(connector);
   
      @override
      ViewModel fromStore() => ViewModel(
          name: state.names[widget.user],             
          );
      }
   ```

   The `vm` parameter's architecture lets you create separate methods for helping construct your
   model, without having to pass the `store` around. For example:

   ```dart
   @override
   ViewModel fromStore() => ViewModel(
       name: _name(),
       onSave: _onSave,
   );
    
   String _name() => state.user.name;
    
   VoidCallback _onSave: () => dispatch(SaveUserAction()),
   ```  

   You can reference the view-model inside the Factory methods, by using the `vm` getter.
   For example:

   ```dart
   @override
   ViewModel fromStore() => ViewModel(
       name: state.user.name,
       onSave: _onSaveName,
   );       
   
   // Use `vm.name` here.  
   VoidCallback _onSaveName: () => dispatch(SaveUserAction(vm.name)),
   ```            

   Please note, you can only use the `vm` getter after the `fromStore()` method returns, which
   means you cannot use it inside the `fromStore()` method itself. If you do that,
   you'll get a `StoreException`.

   <br></br>

   Another idea is to subclass `VmFactory` to:

  * Reduce boilerplate, and not having to pass the `AppState` type parameter whenever you
    create a Factory.

  * Provide additional features to your model. For example, you could add extra getters to help
    you access state.

   Example:

   ```dart       
   abstract class BaseFactory<T extends Widget?, Model extends Vm> 
     extends VmFactory<AppState, T, Model> {
          
     BaseFactory([T? connector]) : super(connector);
         
     User get user => state.user;        
   }
    
   class _Factory extends BaseFactory {
    
     @override
     ViewModel fromStore() => ViewModel(
        name: user.name, // Instead of `name: state.user.name`       
     );                                    
   }
   ```   

   <br></br>

**What if you can't generate the view-model?**

Note: Sometimes you don't have enough information to generate the view-model. For example, some
information may still be loading, or the state is inconsistent for some reason. In that case,
your Factory can return `null` instead of the `vm`, and the connector can return an alternative
placeholder widget.

To that end, declare the view-model as nullable (`ViewModel?`) in these 3 places:
the `StoreConnector`, the `builder`, and the `fromStore` method. Then, check for `null` in
the `builder`. For example:

   ```dart                               
   return StoreConnector<AppState, ViewModel?>( // 1. Use `ViewModel?` here!
   vm: () => Factory(this),       
   builder: (BuildContext context, ViewModel? vm) { // 2. Use `ViewModel?` here!
     return (vm == null) // 3. Check for null view-model here.
       ? Text("The user is not logged in")
       : MyHomePage(user: vm.user)
   
   ...                         
   
   class Factory extends VmFactory<AppState, MyHomePageConnector, ViewModel> {   
   ViewModel? fromStore() { // 4. Use `ViewModel?` here!
   return (store.state.user == null)
       ? null
       : ViewModel(user: store.state.user)
   
   ...
   
   class ViewModel extends Vm {
   final User user;  
   ViewModel({required this.user}) : super(equals: [user]);
   ```         

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_null_viewmodel.dart">Null ViewModel Example</a>.

   <br></br>

2. The `converter` parameter

   If you are migrating from `flutter_redux` to `async_redux`, you can keep using `flutter_redux`'s
   good old `converter` parameter:

   ```dart
   @override
     Widget build(BuildContext context) {
       return StoreConnector<int, ViewModel>(
         converter: (store) => ViewModel.fromStore(store),
         builder: (BuildContext context, ViewModel vm) => MyWidget(...),
       );
     }
   ```

   It expects a static factory function that gets a `store` and returns the `ViewModel`.

    ```dart
    class ViewModel {
       final String name;
       final VoidCallback onSave;
    
       ViewModel({
          required this.name,
          required this.onSave,
       });
    
       static ViewModel fromStore(Store<AppState> store) {
          return ViewModel(
             name: store.state,
             onSave: () => store.dispatch(IncrementAction(amount: 1)),
          );
       }
    
       @override
       bool operator ==(Object other) =>
           identical(this, other) ||
           other is ViewModel && runtimeType == other.runtimeType && name == other.name;
    
       @override
       int get hashCode => name.hashCode;
    }
    ```                     

However, the `converter` parameter can also make use of the `Vm` class to avoid having to
create `operator ==` and `hashcode` manually:

    ```dart
    class ViewModel extends Vm {
       final String name;
       final VoidCallback onSave;
    
       ViewModel({
          required this.name,
          required this.onSave,
       }) : super(equals: [name]);
    
       static ViewModel fromStore(Store<AppState> store) {
          return ViewModel(
             name: store.state,
             onSave: () => store.dispatch(IncrementAction(amount: 1)),
          );
       }    
    }
    ```                     

When using the `converter` parameter, it's a bit more difficult to create separate methods for
helping construct your view-model:

    ```dart
    static ViewModel fromStore(Store<AppState> store) {
       return ViewModel(
          name: _name(store),
          onSave: _onSave(store),
       );
    }
    
    static String _name(Store<AppState>) => store.state.user.name;
    
    static VoidCallback _onSave(Store<AppState>) { 
       return () => store.dispatch(SaveUserAction());
    } 
    ```

To see the `converter` parameter in action, please run
<a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_static_view_model.dart">this example</a>.

## Will a state change always trigger the StoreConnectors?

Usually yes, but if you want you can order some action not to trigger the `StoreConnector`, by
providing a `notify: false` when dispatching:

```dart
dispatch(MyAction1(), notify: false); 
```
