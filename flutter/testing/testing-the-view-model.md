---
sidebar_position: 3
---

# Testing the View-Model

To test the `StoreConnector`'s view-model generated by a `VmFactory`, 
you can use the static method `Vm.createFrom` and pass it the
`store` and the `factory`. 

Note this method must be called in a recently created factory, 
as it can only be called once per factory instance.

The method will return the **view-model**, which you can use to:

* Inspect the view-model properties directly, or

* Call any of the view-model callbacks. If the callbacks dispatch actions,
  you can use `await store.waitAllActions([])`,
  or `await store.waitActionType(MyAction)`,
  or `await store.waitAllActionTypes([MyAction, OtherAction])`,  
  or `await store.waitAnyActionTypeFinishes([MyAction, OtherAction])`,  
  or `await store.waitCondition((state) => ...)`,
  or if necessary you can even record all dispatched actions and state changes
  with `Store.record.start()` and `Store.record.stop()`.

Example:

```dart
var store = Store(initialState: User("Mary"));
var vm = Vm.createFrom(store, MyFactory());

// Checking a view-model property.
expect(vm.user.name, "Mary");

// Calling a view-model callback 
// and waiting for the action to finish.
vm.onChangeNameTo("Bill"); // Dispatch SetNameAction("Bill")
await store.waitActionType(SetNameAction);
expect(store.state.name, "Bill");

// Calling a view-model callback 
// and waiting for the state to change.
vm.onChangeNameTo("Bill"); // Dispatch SetNameAction("Bill")
await store.waitCondition((state) => state.name == "Bill");
expect(store.state.name, "Bill");
```