---
sidebar_position: 12
---

# Connector

In Redux, you generally have two widgets, one called the "dumb-widget", which knows nothing about
Redux and the store, and another one to "wire" the store with that dumb-widget.

While Vanilla Redux traditionally calls these wiring widgets "containers", Flutter's most common
widget is already called a `Container`, which can be confusing. So I prefer calling them "
connectors".

They do their magic by using a `StoreConnector` and a `ViewModel`.

A view-model is a helper object to a `StoreConnector` widget. It holds the part of the Store state
the corresponding dumb-widget needs, and may also convert this state part into a more convenient
format for the dumb-widget to work with.

In more detail: Each time some action reducer changes the store state, all `StoreConnector`s in the
screen will use that state to create a new view-model, and then compare it with the previous
view-model created with the previous state. Only if the view-model changed, the connector rebuilds.

For example:

```dart
class MyHomePageConnector extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
	return StoreConnector<AppState, ViewModel>(
	  vm: () => Factory(this),
	  builder: (BuildContext context, ViewModel vm) => MyHomePage(
		counter: vm.counter,
		description: vm.description,
		onIncrement: vm.onIncrement,
	  ));
  }}

class Factory extends VmFactory<AppState, MyHomePageConnector, ViewModel> {
  Factory(connector) : super(connector);
  @override
  ViewModel fromStore() => ViewModel(
      counter: state.counter,
      description: state.description,
      onIncrement: () => dispatch(IncrementAndGetDescriptionAction()),
      );
}

class ViewModel extends Vm {  
  final int counter;
  final String description;
  final VoidCallback onIncrement;
  ViewModel({
       required this.counter,
       required this.description,
       required this.onIncrement,
  }) : super(equals: [counter, description]);
}
```

For the view-model comparison to work, your ViewModel class must implement equals/hashcode.
Otherwise, the `StoreConnector` will think the view-model changes everytime, and thus will rebuild
everytime. This won't create any visible problems to your app, but is inefficient and may be slow.

The equals/hashcode can be done in three ways:

* By typing `ALT`+`INSERT` in IntelliJ IDEA and choosing `==() and hashcode`. You can't forget to
  update this whenever new parameters are added to the model.

* You can use the <a href="https://pub.dev/packages/built_value">built_value</a> package to ensure
  they are kept correct, without you having to update them manually.

* Just add all the fields you want (which are not callbacks) to the `equals` parameter to
  the `ViewModel`'s `build` constructor. This will allow the ViewModel to automatically create its
  own `operator ==` and `hashcode` implicitly. For example:

```dart
ViewModel({
  required this.field1,
  required this.field2,
}) : super(equals: [field1, field2]);
```      

Note: Each state passed in the `equals` parameter will, by default, be compared by equality (`==`).
However, you can provide your own comparison method, if you want. To that end, your state classes
may implement the `VmEquals` interface. As a default, objects of type `VmEquals` are compared by
their `VmEquals.vmEquals()` method, which by default is an identity comparison. You may then
override this method to provide your custom comparisons.

For example, here `description` will be compared by equality, while `myObj` will be compared by
its `info` length:

```dart
class ViewModel extends Vm {
  final String description;
  final MyObj myObj;  

  ViewModel({
    required this.description,
    required this.myObj,
  }) : super(equals: [description, myObj]);
}

...

class MyObj extends VmEquals<MyObj> {  
  String info; 
  bool operator ==(Object other) => info.length == other.info.length;
  int get hashCode => 0;
}
```
