---
sidebar_position: 5
---

# Migrating from flutter_redux

Read this page only if you are migrating from `flutter_redux` (vanilla Redux) to AsyncRedux.

## The converter parameter

The `StoreConnector` actually accepts two mutually exclusive parameters that can create
the `ViewModel`, of which **only one** should be provided in the `StoreConnector`
constructor: 

* `vm` (recommended) or 
* `converter`

We have already discusses the `vm` parameter, and that's the **recommended way** to provide the
`ViewModel` to the `StoreConnector`. 

However, if you are migrating from `flutter_redux` (vanilla Redux) to AsyncRedux, 
you can keep using `flutter_redux`'s `converter` parameter:

```dart
Widget build(BuildContext context) {

  return StoreConnector<int, ViewModel>(
    converter: (store) => ViewModel.fromStore(store),
    builder: (BuildContext context, ViewModel vm) => MyWidget(...),
  );
}
```

On contrary to the `vm` parameter, your `ViewModel` class here does not need to extend `Vm`,
and you don't need to use `VmFactory` to create it.

Simply add a static factory to your `ViewModel`. It should get a `store` and return the `ViewModel`:

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
 
  bool operator ==(Object other) =>
    identical(this, other) ||
    other is ViewModel && runtimeType == other.runtimeType && name == other.name;
 }
 ```                     

However, if desired, the `converter` parameter can also make use of the `Vm` class to avoid 
having to create `operator ==` manually:

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
