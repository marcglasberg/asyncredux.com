---
sidebar_position: 16
---

# Database

How to interact with the database?

The following advice works for any Redux version, including AsyncRedux.

Pretend the user presses a button in the dumb-widget, running a callback which was passed in its
constructor. This callback, which was created by the Connector widget, will dispatch an action.

This action's async reducer will connect to the database and get the desired information. You can
**directly** connect to the database from the async reducer, or have a **DAO** to abstract the
database implementation details.

This would be your reducer:

```dart
@override
Future<AppState> reduce() async {
	var something = await myDao.loadSomething();
	return state.copy(something: something);
}
```

This rebuilds your widgets that depend on `something`, with its new value. The state now holds the
new `something`, and the local store persistor may persist this value to the local file system, if
that's what you want.

