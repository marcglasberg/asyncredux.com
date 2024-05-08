---
sidebar_position: 16
---

# Database and Cloud

How to interact with the database or the cloud?

Pretend the user presses a button in the widget, which ends up dispatching an action.
This action's reducer will connect to the cloud and/or database to get the desired information.

You could directly connect to the cloud and database from the async reducer,
but it's better to have a **DAO** (data access object) to abstract those implementation
details.

This could be your action's reducer:

```dart
Future<AppState> reduce() async {
	var something = await myDao.loadSomething();
	return state.copy(something: something);
}
```

In this example, all the implementation details on how to interact with the database are not
present in the action reducer itself, but are instead hidden in the `loadSomething` method
of the DAO. 
