---
sidebar_position: 13
---

# Persistence

When you create your store, you can optionally pass a `persistor`.
This object handles local persistence,
meaning it keeps the current app state saved to the device's disk.

You should create your own `MyPersistor` class that extends the `Persistor` abstract class.
Note: Always use `extends Persistor`, never `implements Persistor`.
Here is the recommended way to use it:

```dart                       
var persistor = MyPersistor();          

var initialState = await persistor.readState();

if (initialState == null) {
  initialState = AppState.initialState();
  await persistor.saveInitialState(initialState);
}

var store = Store<AppState>(
  initialState: initialState,  
  persistor: persistor,
);
```           

At startup, the app calls the persistor's `readState` method to try to read the state from disk.
If this method returns `null`, you must create the default initial state and save it.
Then create the store with that `initialState` and the `persistor`.

Here is the abstract `Persistor` definition:

```dart
abstract class Persistor<St> {
  Future<St?> readState();  
  Future<void> deleteState();  
  Future<void> persistDifference({required St? lastPersistedState, required St newState});  
  Future<void> saveInitialState(St state) => persistDifference(lastPersistedState: null, newState: state);    
  Duration? get throttle => const Duration(seconds: 2);
  Object? wrapError(Object error, StackTrace stackTrace) => error;
  void addError(Object error, [StackTrace? stackTrace]); // Protected.
}
```                   

The `persistDifference` method is the one you should implement to save the state.
It provides both `newState` and `lastPersistedState`, so you can compare them
and save only the difference. Or, if the state is simple, you can just save
the whole `newState` each time.

Note AsyncRedux will call `persistDifference` whenever the state changes,
but never more than once every 2 seconds,
which is the throttle period.
All changes within this time will be collected and saved in a single call.

This method will not be called again until the previous save has finished.
If a new state becomes available during a save,
the method will run again only as soon as the current save completes.

You can override the `throttle` getter to change the throttle period.
If you return `null`, no throttle will be used and the state will be saved as soon as it changes.

Sometimes you may want to save the state immediately, for example when the app is closing.
You can do that by dispatching `PersistAction`, which ignores the throttle and
calls `persistDifference` right away.

```dart
store.dispatch(PersistAction());
```  

## Extending Persistor

Here is some code to help you start extending `Persistor`:

```dart
class MyPersistor extends Persistor<AppState> {  
  
  Future<AppState?> readState() async {
    // TODO: Put here the code to read the state from disk.
    return null;
  }
  
  Future<void> deleteState() async {
    // TODO: Put here the code to delete the state from disk.
  }
  
  Future<void> persistDifference({
    required AppState? lastPersistedState,
    required AppState newState,
  }) async {
    // TODO: Put here the code to save the state to disk.
  }
  
  Future<void> saveInitialState(AppState state) =>
      persistDifference(lastPersistedState: null, newState: state);
  
  Duration? get throttle => const Duration(seconds: 2);

  Object? wrapError(Object error, StackTrace stackTrace) => error;
}
```

## Errors when saving the state

If `persistDifference` throws an error, AsyncRedux keeps working normally,
and the persistor will keep saving the state in the future.
The state that failed to be saved is **not** considered persisted,
so the next call to `persistDifference` will get the same `lastPersistedState`,
and the difference will include the changes that failed to be saved.

The error is then processed the same way as errors thrown by actions:

1. First, it's given to the persistor's `wrapError` method.
   It works just like the action's [wrapError](../advanced-actions/errors-thrown-by-actions):
   return the error unaltered to keep it, return another error to replace it,
   or return `null` to swallow it. By default, it returns the error unaltered.

2. Then, it's given to the [GlobalErrorObserver](./error-monitoring), if you defined one,
   so that you can log it, change it, or swallow it.
   In this case, the observer's `action` is `null`,
   and its `originalError` is the error before `wrapError`.

3. Finally, if the resulting error is a `UserException`, it goes to the store's error queue,
   so that it's shown to the user, just like a `UserException` thrown by an action.
   Any other error is thrown as an unhandled async error
   (which is usually printed to the console).

For example, this will show an error dialog to the user if saving to disk fails:

```dart
class MyPersistor extends Persistor<AppState> {
  ...

  @override
  Object? wrapError(Object error, StackTrace stackTrace) =>
      (error is FileSystemException)
          ? UserException('Could not save your data.').addCause(error)
          : error;
}
```

## Reporting errors when reading the state

The `readState` method is usually called when the app starts, before the store is created.
For this reason, it can't show errors to the user by throwing them.

For example, suppose the saved data is in the format of an old version of your app,
and can't be read. You may decide to delete it and start over,
but the user should know their data was reset.

To do that, call the persistor's `addError` method.
The persistor keeps the error until the store is created,
and then the store processes it:

```dart
class MyPersistor extends Persistor<AppState> {
  ...

  @override
  Future<AppState?> readState() async {
    try {
      return await _read();
    } on FormatException catch (error) {
      await deleteState();
      addError(UserException('Could not read your data, so it was reset.').addCause(error));
      return null;
    }
  }
}
```

The errors added with `addError` are processed like the errors thrown when saving the state:
they are given to the [GlobalErrorObserver](./error-monitoring) (with a `null` action),
and then a `UserException` goes to the store's error queue,
so that it's shown to the user as soon as the `UserExceptionDialog` is mounted.
The only difference is that they are not given to the persistor's `wrapError`,
since you are adding them on purpose, already in the form you want.

You can call `addError` from any persistor method, not only from `readState`.
The store gets the added errors when it's created,
and then again after each persistence operation (reading, deleting or saving the state).

## Other Persistor Features

The persistor can be paused and resumed with `store.pausePersistor()`, `store.persistAndPausePersistor()` and
`store.resumePersistor()`. This can be useful with the app lifecycle, so that persistence does not start while the app
is shutting down.

When the user logs out of your app, call `store.deletePersistedState()` to delete the state from disk.

First, add an `AppLifecycleManager` to your widget tree:

```dart
...
child: StoreProvider<AppState>(
  store: store,
    child: AppLifecycleManager(
      child: MaterialApp( ...
```

Then create the `AppLifecycleManager` with a `WidgetsBindingObserver` that dispatches
a `ProcessLifecycleChange_Action`:

```dart
class AppLifecycleManager extends StatefulWidget {
  final Widget child;
  const AppLifecycleManager({Key? key, required this.child}) : super(key: key);  
  _AppLifecycleManagerState createState() => _AppLifecycleManagerState();
}

class _AppLifecycleManagerState extends State<AppLifecycleManager> with WidgetsBindingObserver {  

  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  void didChangeAppLifecycleState(AppLifecycleState lifecycle) {
    store.dispatch(ProcessLifecycleChange_Action(lifecycle));
  }
  
  Widget build(BuildContext context) => widget.child;
}
```

Finally, define your `ProcessLifecycleChange_Action` to pause and resume the persistor:

```dart
class ProcessLifecycleChange extends ReduxAction<AppState> {
  final AppLifecycleState lifecycle;
  ProcessLifecycleChange(this.lifecycle);

  Future<AppState?> reduce() async {
    if (lifecycle == AppLifecycleState.resumed || lifecycle == AppLifecycleState.inactive) {
      store.resumePersistor();  
    } else if (lifecycle == AppLifecycleState.paused || lifecycle == AppLifecycleState.detached) {
      store.persistAndPausePersistor();
    } else
      throw AssertionError(lifecycle);

    return null;
  }
}
```

Have a look at
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/test/persistence_test.dart">
Persistence tests</a>.

<br></br>

## Saving and Loading

You can use any method you prefer to save the state to disk,
but an easy option is the provided `LocalPersist` class.

Note: It currently works only for Android and iOS, not for the web.

First, import it:

```dart 
import 'package:async_redux/local_persist.dart';
```

You must convert your objects to a list of **simple objects** made only of numbers,
booleans, strings, lists and maps. You can nest lists and maps.

Example:

```dart
List<Object> simpleObjs = [
  'Goodbye',
  'Life is what happens\nwhen you are busy making other plans.',
  [100, 200, {"name": "João"}],
  true,
  42,
];
```

Then create a `LocalPersist` instance to use the `/db/myFile.db` file:

```dart
var persist = LocalPersist("myFile");
```

Save the list to the file:

```dart
await persist.save(simpleObjs);
```

And then later load it:

```dart                                       
List<Object> simpleObjs = await persistence.load();
```

The `save` method usually rewrites the file, but it can also append data:

```dart
List<Object> moreObjs = ['Lets', 'append', 'more'];
await persist.save(simpleObjs, append: true);
```

You can delete the file, check its length, or see if it exists:

```dart                      
int length = await persist.length();
bool exists = await persist.exists();
await persist.delete();
```                            

Note `LocalPersist` uses a format similar to JSON but not exactly JSON, since JSON cannot be appended to. 
If you want to save and load a single object using standard JSON, use `saveJson` and `loadJson`:

```dart
await persist.saveJson(simpleObj);
Object? simpleObj = await persistence.loadJson();
```

Have a look at
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/test/local_persist_test.dart">
Local Persist tests</a>.
