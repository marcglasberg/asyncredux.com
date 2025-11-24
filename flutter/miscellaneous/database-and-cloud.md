---
sidebar_position: 17
---

# Database and Cloud

How do you interact with the database or the cloud?

Imagine the user presses a button in the widget, which dispatches an **action**.
The action reducer then connects to the cloud or database to fetch some information.

You could connect to the cloud or database directly inside the async reducer,
but it is better to use a **DAO** (data access object) to hide those details.

Here is an example action reducer:

```dart
Future<AppState> reduce() async {
  var something = await myDao.loadSomething();
  return state.copy(something: something);
}
```

In this example, the code that handles the database interaction is not in the reducer itself.
It is kept inside the DAO, in the `loadSomething` method.

To see some complete examples of using Async Redux with DAOs, check out these GitHub repos:
* [SameAppDifferentTech - Flutter with Redux](https://github.com/marcglasberg/SameAppDifferentTech/blob/main/MobileAppFlutterRedux/README.md) 
* [Redux App Example](https://github.com/marcglasberg/redux_app_example) 
