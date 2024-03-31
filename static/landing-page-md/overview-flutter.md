# Store, state, actions and reducers

The store holds all the application **state**, and you can only change the state by
dispatching **actions**. Each action has its own **reducer**, which changes the state.

```dart
// The store holds the app state
var store = Store<int>(initialState: 1);

// Actions have a reducer to change the state
class Increment extends Action {
  int reduce() => state + 1;
}

void main() {
  // Dispatch actions to change the state
  store.dispatch(Increment());
}
```

&nbsp;

# Use the Store

Add a `StoreProvider` to the top of your widget tree.

```dart
Widget build(BuildContext context) {
  return StoreProvider<int>(
    store: store,
    child: MaterialApp(home: MyHomePage()), ...
    );
}
```

&nbsp;

You can then use it in any widget:

```dart
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    return Column(children: [
        
      // Use the state.
      Text(context.state.toString()),

      ElevatedButton(
        // Dispatch the action.
        onPressed: () => context.dispatch(Increment()))
    ]);
  }
}
```

&nbsp;

# Action can do asynchronous work

They download information from the internet, or do any other async work.

```dart
var store = Store<String>(initialState: '');
```

```dart
class LoadText extends Action {

  // This reducer returns a Future.  
  Future<String> reduce() async {
  
    // Download some information from the internet.
    var response = await http.get('http://numbersapi.com/42');    
    
    // Change the state with the downloaded information.
    return response.body;      
  }
}
```

&nbsp;

# Action can throw errors

If some error happens, you can simply throw an `UserException`.
A dialog (or other UI) will open automatically, showing the error message to the user.

```dart
var store = Store<String>(initialState: '');
```

```dart
class LoadText extends Action {
    
  Future<String> reduce() async {  
    var response = await http.get('http://numbersapi.com/42');    

    if (response.statusCode == 200) return response.body;
    else throw UserException('Failed to load data');         
  }
}
```

&nbsp;

To show a spinner while the action is loading, use `isWaiting`.

To show an error message as a widget, use `isFailed`.

```dart
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
  
    if (context.isWaiting(LoadText)) return CircularProgressIndicator();
    if (context.isFailed(LoadText)) return Text('Loading failed...');
    
    return Column(children: [
      
       Text(context.state), // Show the state
                      
       // Dispatch the action.
       ElevatedButton(
         onPressed: () => context.dispatch(LoadText()))                
    ]);    
  }
}
```

&nbsp;

# Actions can dispatch other actions

And you can even use `dispatchAndWait` to wait for an action to finish.

```dart
class LoadTextAndIncrement extends Action {

  Future<String> reduce() async {
    var text = await dispatchAndWait(LoadText());
    dispatch(Increment());
    return text;
  }
}
```

&nbsp;

# Check for Internet connectivity

You can add **mixins** to your actions, to accomplish common tasks.

`CheckInternet` ensures actions only run with internet,
otherwise an **error dialog** prompts users to check their connection:

```dart
class LoadText extends Action with CheckInternet {
      
   Future<String> reduce() async {
      var response = await http.get('http://numbersapi.com/42');
      ...      
   }
}   
```

&nbsp;

`NoDialog` can be added to `CheckInternet` so that no dialog is opened.
Instead, you can display some information in your widgets:

```dart
class LoadText extends Action with CheckInternet, NoDialog { 
  ... 
  }

class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {     
     if (context.isFailed(LoadText)) Text('No Internet connection');
  }
}   
```

&nbsp;

`AbortWhenNoInternet` aborts the action silently (without showing any dialogs) if there is no
internet connection.

&nbsp;

# Add features to your actions

`NonReentrant` prevents reentrant actions,
so that it gets aborted when you dispatch an action that's already running.

```dart
class LoadText extends Action with NonReentrant {
   ...
   }
```

&nbsp;

`Retry` retries the action a few times with exponential backoff, if it fails.

Add `UnlimitedRetries` to retry the action indefinitely:

```dart
class LoadText extends Action with Retry, UnlimitedRetries {
   ...
   }
```

&nbsp;

# Persist the state

You can add a `persistor` to save the state to the local device disk.

```dart
var store = Store<String>(
  persistor: MyPersistor(),  
);  
```

&nbsp;

# Testing your app is easy

Just dispatch actions and wait for them to finish.
Then, verify the new state or check if some error was thrown.

```dart
class AppState {  
  List<String> items;    
  int selectedItem;
}

test('Selecting an item', () async {   

    var store = Store<AppState>(
      initialState: AppState(        
        items: ['A', 'B', 'C']
        selectedItem: -1, // No item selected
      ));
    
    // Should select item 2.                
    await store.dispatchAndWait(SelectItem(2));    
    expect(store.state.selectedItem, 'B');
    
    // Fail to select item 42.
    var status = await store.dispatchAndWait(SelectItem(42));    
    expect(status.originalError, isA<>(UserException));
});
```

&nbsp;

# Advanced setup

If you are the Team Lead, you set up the app's infrastructure in a central place,
and allow your developers to concentrate solely on the business logic.

You can add a `stateObserver` to collect app metrics, an `errorObserver` to log errors,
an `actionObserver` to print information to the console during development,
and a `globalWrapError` to catch all errors.

```dart
var store = Store<String>(    
  stateObserver: [MyStateObserver()],
  errorObserver: [MyErrorObserver()],
  actionObservers: [MyActionObserver()],
  globalWrapError: MyGlobalWrapError(),
```

&nbsp;

For example, the following `globalWrapError` handles `PlatformException` errors throw
by Firebase. It converts them into `UserException` errors, which are built-in Async Redux types that
automatically display their message to the user in an error dialog:

```dart
Object? wrap(error, stackTrace, action) =>
  (error is PlatformException)
    ? UserException('Error connecting to Firebase')
    : error;
}  
```

&nbsp;

# Advanced action configuration

The Team Leads may create a base action class that all actions will extend, and add some common
functionality to it. For example, add getter shortcuts to important parts of the state,
and also selectors to help find more complex information.

```dart
// If this is the app state
class AppState {  
  List<Item> items;    
  int selectedItem;
}

class Action extends ReduxAction<AppState> {

  // Getter shortcuts   
  List<Item> get items => state.items;
  Item get selectedItem => state.selectedItem;
  
  // Selectors 
  Item? findItemById(int id) => items.firstWhereOrNull((item) => item.id == id);
  Item? searchItemByText(String text) => items.firstWhereOrNull((item) => item.text.contains(text));
  int get selectedItemIndex => items.indexOf(selectedItem);     
}
```

&nbsp;

Now, all actions can use these to access the state in their reducers:

```dart
class SelectItem extends Action {
  final int id;
  SelectItem(this.id);
    
  AppState reduce() {
    Item? item = findItemById(id);
    if (item == null) throw UserException('Item not found');
    return state.copy(selected: item);
  }    
}
```

&nbsp;

---

Async Redux's mascot is a platypus with a keyboard. The platypus is a mix of different animals,
just like Async Redux gets ideas from different state management solutions
to create something unique. Async Redux is a Redux version which is not affiliated
with the Redux team or Meta. It has no code in common with the original Redux or 
with Redux Toolkit, but it follows similar principles.
