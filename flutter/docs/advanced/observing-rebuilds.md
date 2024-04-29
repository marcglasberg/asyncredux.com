---
sidebar_position: 15
---

# Observing rebuilds

Your store optionally accepts a `modelObserver`, which lets you visualize rebuilds.
It's rarely used, so feel free to skip this section.

The `ModelObserver` is an abstract class with an `observe` method which you can implement to be
notified, by each `StoreConnector` currently in the widget tree, whenever there is a state change.
You can create your own `ModelObserver`, but the provided `DefaultModelObserver` can be used out of
the box to print to the console and do basic testing:

```dart
var store = Store<AppState>(
  initialState: state,
  modelObserver: DefaultModelObserver(),  
);
```                                      

This is an example output to the console, showing how `MyWidgetConnector` responded to 3 state
changes:

    Model D:1 R:1 = Rebuid:true, Connector: MyWidgetConnector, Model: MyViewModel{B}.
    Model D:2 R:2 = Rebuid:false, Connector: MyWidgetConnector, Model: MyViewModel{B}.
    Model D:3 R:3 = Rebuid:true, Connector: MyWidgetConnector, Model: MyViewModel{C}.

You can see above that the first and third state changes resulted in a rebuild (`Rebuid:true`), but
the second one did not, probably because the part of the state that changed was not part
of `MyViewModel`.

<a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_dispatch_future.dart">This example</a>
also shows the `ModelObserver` in action.

Note: You must pass `debug:this` as a `StoreConnector` constructor parameter, if you want
the `ModelObserver` to be able to print the `StoreConnector` type to the output. You can also
override your `ViewModel.toString()` to print out any extra info you need.

The `ModelObserver` is also useful when you want to create tests to assert that rebuilds happen
when and only when the appropriate parts of the state change. For an example, see
the <a href="https://github.com/marcglasberg/async_redux/blob/master/test/model_observer_test.dart">
Model Observer Test</a>.
