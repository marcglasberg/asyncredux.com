---
sidebar_position: 12
---

# Connector pattern

As previously discussed, you
can [access the store state](../basics/using-the-store-state)
and [dispatch actions](../basics/dispatching-actions#dispatching-from-widgets) from any widget,
by using the extension methods on `BuildContext`:

```dart
// In a widget
context.state.counter;
context.dispatch(MyAction());
```

However, this is not always the best practice for larger complex apps.

The problem here is, of course, that you are accessing the state (the business layer) directly
from inside the UI. Also, sometimes the part of the state that your widget needs to use
is buried deep inside the state tree, or needs some transformation before it can be used.

Doing all that inside your widgets makes them harder to read and maintain.

It's also more difficult to test, because you can't easily test the UI without the store, and you
can't easily test the store without the UI.

With Redux, you have the option of first separating and transforming the part of the state that
your widget needs into a separate object, called the "view model", and them simply using that
object in your widget. This is done by using a `StoreConnector` widget.

> Note: While vanilla Redux traditionally calls these wiring widgets "containers", Flutter's
> most common widget is already called a `Container`, which can be confusing. So I prefer calling
> them "connectors", as they _connect_ the store to the UI.

## StoreConnector

If you want to separate the store from the UI, you can create one widget that knows about the store
and the state, and another widget that knows nothing about the store, but uses the state.

These two widgets are sometimes called "smart" and "dumb" widgets, where the smart widget is the
one with access to the store:

* The smart widget reads the store state, and uses a "factory" to prepare the "view-model".
* The view-model is simply an object that contains only the information the dumb widget needs.
* The information in the view-model is in a convenient format for the dumb-widget to work with.
* The view-model may also contain function callbacks that the dumb widget needs to dispatch actions.
* The dumb widget then uses the view-model to build itself.
* The dumb widget knows nothing about the store or the state.

Async Redux provides 3 base classes to help you create these smart widgets:

* `StoreConnector`
* `VmFactory`
* `ViewModel`

## The process

Each time some action reducer changes the store state, all the widgets in the screen that
use that state should rebuild.

This means that all widgets that are currently in the screen (in the widget tree),
and that contain `StoreConnector`s, will create a **factories** object, and as this
factory to create them a new **view-model** object, from the most current state.

The factory itself is simply an object that is specialized in creating the view-model from the
store state.

Once the view-model is created, the `StoreConnector` will compare it with the previous view-model
created with the previous state. Only if the view-model changed, the connector rebuilds,
sending the new view-model to the dumb widget to rebuild.

If the view-model didn't change, the connector doesn't rebuild. This makes sense because
the view-model contains all the information the dumb widget needs, and if that information
didn't change, there is no need to rebuild the dumb widget.

> Note: Whenever the state changes, all the `StoreConnector`s will recalculate the view-model,
> always. This means that creating the view-model should be a fast operation. If it's not, you
> should consider using a `Selector` widget to optimize the process (more on that later).
> However, if the view-model did not chance, no dumb widget rebuilding takes place.

## Example

Let's create a dumb widget called `MyCounter`, which is a counter widget.
It displays a `description` for the current `counter` number,
and uses an `onIncrement` function to increment the counter when a button is pressed:

```dart
MyCounter(
  counter: 2,
  description: "2 is the first non-zero even number",
  onIncrement: () { ... },
);
```

The connector will be called `MyCounterConnector`.
It contains a `StoreConnector`, with a `builder` method that creates
the `MyCounter` widget:

```dart
class MyCounterConnector extends StatelessWidget {
  
  Widget build(BuildContext context) {
	return StoreConnector( 
	  ... MyCounter(...)
```

The `StoreConnector` has a few interesting parameters, but the most important are
the `vm` and `builder` parameters:

```dart
class MyCounterConnector extends StatelessWidget {
  
  Widget build(BuildContext context) {
	return StoreConnector(
	  vm: () => Factory(this),
	  builder: (...) => MyCounter(...)
```

The `vm` parameter is a function that when called should return a factory of type `VmFactory`:

Async Redux will use the `vm` parameter to create a factory,
and then will use this factory to create the current view-model of type `Vm`.

The current view-model will be compared with the previous view-model. In case they
are different, Async Redux will call the `builder` and pass it the new view-model.

Finally, the `builder` will use the view-model to create the dumb widget.

This is the complete connector code:

```dart
class MyCounterConnector extends StatelessWidget {
  
  Widget build(BuildContext context) {
	return StoreConnector<AppState, ViewModel>(
	  vm: () => Factory(this),
	  builder: (BuildContext context, ViewModel vm) => MyCounter(
		counter: vm.counter,
		description: vm.description,
		onIncrement: vm.onIncrement,
	  ));
  }}
```

## View-model

From the above code it's obvious that the view-model should contain the `counter`, `description`
and `onIncrement` fields. It must extend `Vm`:

```dart
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

As discussed, Async Redux needs to compare the previous and current view-models.
This means your `ViewModel` object needs to implement the `operator ==` method.

If you don't, all view-models will be considered different from each other,
which will result in the connector always rebuilding, even when not necessary.
This won't create any visible problems to your app, but is inefficient and may be slow.

The `operator ==` method may be implemented in three ways:

* By typing `ALT`+`INSERT` in IntelliJ IDEA and choosing `==() and hashcode`. You can't forget to
  update this whenever new parameters are added to the model.

* You can use the <a href="https://pub.dev/packages/built_value">built_value</a> package to ensure
  they are kept correct, without you having to update them manually.

* Just add all the fields you want (which are not functions/callbacks) to the `equals` parameter to
  the `ViewModel`'s `equal` parameter. This will allow the view-model to automatically create its
  own `operator ==` implicitly. For example:

```dart
ViewModel({
  required this.field1,
  required this.field2,
}) : super(equals: [field1, field2]);
```      
        
## The VmEquals interface 

Each state passed in the `equals` parameter will, by default, be compared by equality (`==`).
This is almost always what you want.

However, you can provide your own comparison method, if you want. To that end, your state classes
must implement the `VmEquals` interface. As a default, objects of type `VmEquals` are compared by
their own `VmEquals.vmEquals()` method, which by default is an identity comparison. 

You may then override this method to provide your custom comparisons.

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

## Factory

You also need to create a factory object to create the view-model from the store state.
It must extend `VmFactory` and implement the `fromStore` method:

```dart
class Factory 
  extends VmFactory<AppState, MyCounterConnector, ViewModel> {  
  Factory(connector) : super(connector);  
  
  ViewModel fromStore() => ViewModel(
    counter: state.counter,
    description: state.description,
    onIncrement: () => dispatch(IncrementAndGetDescriptionAction()),
  );
}
```

The `fromStore` method is called automatically by Async Redux, when necessary.
Note it has direct access to the `state` and to all dispatch methods like `dispatch`, `dispatchAndWait`
etc.

You can also create helper methods to assist you in creating the view-model.

For example, here `description` and the `onIncrement` method are created by helper methods:

```dart
class Factory 
  extends VmFactory<AppState, MyCounterConnector, ViewModel> {  
  Factory(connector) : super(connector);  
  
  ViewModel fromStore() => ViewModel(
    counter: state.counter,
    description: _description(),
    onIncrement: _onIncrement,
  );

  String _description() => state.description;
     
  void _onIncrement() => dispatch(IncrementAndGetDescriptionAction());
}
```

This may not seem necessary in this simple example, but for more complex view-models it can be
very useful being able to separate the view-model creation into smaller methods.
               
## The complete example

Here is the complete example:

```dart
class MyCounterConnector extends StatelessWidget {
  
  Widget build(BuildContext context) {
    return StoreConnector<AppState, ViewModel>(
      vm: () => Factory(this),
      builder: (BuildContext context, ViewModel vm) => MyCounter(
        counter: vm.counter,
        description: vm.description,
        onIncrement: vm.onIncrement,
      ));
  }
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

class Factory extends VmFactory<AppState, MyCounterConnector, ViewModel> {
  Factory(connector) : super(connector);

  ViewModel fromStore() => ViewModel(
    counter: state.counter,
    description: state.description,
    onIncrement: () => dispatch(IncrementAndGetDescriptionAction()),
  );
}
```
