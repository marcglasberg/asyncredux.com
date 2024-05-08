---
sidebar_position: 12
---

# Persistence

When you instantiate your store, you can optionally pass it a `persistor`,
which is an object that may be used for local persistence, i.e., keeping
the current app state saved to the local disk of the device.

You should create your own `MyPersistor` class which extends the `Persistor` abstract class. 
This is the recommended way to use it:

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

As you can see above, when the app starts you use the persistor's `readState` method to try and
read the state from the disk.
If this method returns `null`, you must create the default initial state and save it.
You then create the store with that `initialState` and the `persistor`.

This is the abstract `Persistor` definition:

```dart
abstract class Persistor<St> {
  Future<St?> readState();  
  Future<void> deleteState();  
  Future<void> persistDifference({required St? lastPersistedState, required St newState});  
  Future<void> saveInitialState(St state) => persistDifference(lastPersistedState: null, newState: state);    
  Duration get throttle => const Duration(seconds: 2);
}
```                   

The `persistDifference` method is the one you should implement to be notified whenever you must save
the state. It tells you the `newState` and the `lastPersistedState`, so that you can compare them
and save the difference. Or, if your app state is simple, you can simply save the
whole `newState` each time the method is called.

The `persistDifference` method will be called by Async Redux whenever the state changes, but not
more than once each 2 seconds, which is the throttle period. All state changes within these 2
seconds will be collected, and then a single call to the method will be made with all the changes
after this period.

Also, the `persistDifference` method won't be called while the previous save is not finished, even
if the throttle period is done. In this case, if a new state becomes available the method will be
called as soon as the current save finishes.

Note you can also override the `throttle` getter to define a different throttle period. In special,
if you define it as `null` there will be no throttle, and you'll be able to save the state as soon
as it changes.

Even if you have a non-zero throttle period, sometimes you may want to save the state immediately.
This is usually the case, for example, when the app is closing. You can do that by dispatching the
provided `PersistAction`. This action will ignore the throttle period and call
the `persistDifference` method right away to save the current state.

```dart
store.dispatch(PersistAction());
```  

You can use this code to help you start extending the abstract `Persistor` class:

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
  
  Duration get throttle => const Duration(seconds: 2);
}

```

The persistor can also be paused and resumed, with methods `store.pausePersistor()`,
`store.persistAndPausePersistor()` and `store.resumePersistor()`. This may be used together with the
app lifecycle, to prevent a persistence process to start when the app is being shut down.

When logging out of the app, you can call `store.deletePersistedState()` to ask the persistor to
delete the state from disk.

First, add an `AppLifecycleManager` to your widget tree:

```dart
...
child: StoreProvider<AppState>(
  store: store,
    child: AppLifecycleManager(
      child: MaterialApp( ...
```

Then, create the `AppLifecycleManager` with a `WidgetsBindingObserver` that dispatches
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
class ProcessLifecycleChangeAction extends ReduxAction<AppState> {
  final AppLifecycleState lifecycle;
  ProcessLifecycleChangeAction(this.lifecycle);

  @override
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

You can choose any way you want to save the state difference to the local disk, 
but one way is using the provided `LocalPersist` class, which is very easy to use.

Note: At the moment it only works for Android/iOS, not for the web.

First, import it:

```dart 
import 'package:async_redux/local_persist.dart';
```

You need to convert yourself your objects to a list of **simple objects**
composed only of numbers, booleans, strings, lists and maps (you can nest lists and maps).

For example, this is a list of simple objects:

```dart
List<Object> simpleObjs = [
  'Goodbye',
  '"Life is what happens\n\rwhen you\'re busy making other plans." -John Lennon',
  [100, 200, {"name": "João"}],
  true,
  42,
];
```

Then create a `LocalPersist` class to use the `/db/myFile.db` file:

```dart
var persist = LocalPersist("myFile");
```

You can save the list to the file:

```dart
await persist.save(simpleObjs);
```

And then later load these objects:

```dart                                       
List<Object> simpleObjs = await persistence.load();
```

Usually the `save` method rewrites the file. But it also lets you append more objects:

```dart
List<Object> moreObjs = ['Lets', 'append', 'more'];
await persist.save(simpleObjs, append: true);
```

You can also delete the file, get its length, see if it exists etc:

```dart                      
int length = await persist.length();
bool exists = await persist.exists();
await persist.delete();
```                            

Note: `LocalPersist` uses a file format similar to JSON, but not exactly JSON, because JSON cannot
be appended to. If you want to save and load a single object into standard JSON, use the `saveJson`
and `loadJson` methods:

```dart
await persist.saveJson(simpleObj);
Object? simpleObj = await persistence.loadJson();
```

Have a look at
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/test/local_persist_test.dart">
Local Persist tests</a>.
