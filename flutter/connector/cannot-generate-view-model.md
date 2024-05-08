---
sidebar_position: 2
---

# Cannot generate view-model

Sometimes you may not have enough information to generate the view-model.
For example, some information may still be loading, or the state is inconsistent for some reason. 

In that case, your factory can return `null` instead of the `vm`, 
and the connector can return an alternative "placeholder widget".

To do that you'll need to declare the view-model as nullable `ViewModel?` in these 3 places:

* The `StoreConnector`
* The `builder`
* The `fromStore` method. 

Then, check for `null` in the `builder`:

```dart                                     
builder: (BuildContext context, ViewModel? vm) { 
  return (vm == null)
    ? Text("User not logged in")
    : MyHomePage(user: vm.user)
```

This is the complete code:

```dart                               
return StoreConnector<AppState, ViewModel?>( // 1. Nullable here

  vm: () => Factory(this),       
  builder: (BuildContext context, ViewModel? vm) { // 2. Nullable here
    return (vm == null) 
      ? Text("User not logged in")
      : MyHomePage(user: vm.user) 
    ...                         
 
class Factory extends VmFactory<AppState, MyHomePageConnector, ViewModel> {   
  ViewModel? fromStore() { // 3. Nullable here
  return (state.user == null)
    ? null
    : ViewModel(user: state.user) 
  ...
```         

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_null_viewmodel.dart">Null ViewModel Example</a>.


