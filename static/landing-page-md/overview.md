# Store, state, actions and reducers

The store holds all the application **state**, and you can only change the state by
dispatching **actions**. Each action has its own **reducer**, which changes the state.

```tsx
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

```tsx
Widget build(BuildContext context) {
  return StoreProvider<int>(
    store: store,
    child: MaterialApp(home: MyHomePage()), ...
    );
}
```

&nbsp;

You can then use it anywhere in your widgets:

```tsx
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

```tsx
var store = Store<String>(initialState: '');
```

```tsx
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

```tsx
var store = Store<String>(initialState: '');
```

```tsx
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

```tsx
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

```tsx
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

```tsx
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

```tsx
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

```tsx
class LoadText extends Action with NonReentrant {
   ...
   }
```

&nbsp;

`Retry` retries the action a few times with exponential backoff, if it fails.

Add `UnlimitedRetries` to retry the action indefinitely:

```tsx
class LoadText extends Action with Retry, UnlimitedRetries {
   ...
   }
```

&nbsp;

# Testing your app is easy

Just dispatch actions and wait for them to finish.
Then, verify the new state or check if some error was thrown.

```tsx
class AppState {
  User user;
  int selected;
  List<Item> items;    
}

test('Selecting an item', () async {   

    var store = Store<AppState>(
      initialState: AppState(
        user: User(name: 'John'),
        selected: -1,
        items: [Item(id: 1), Item(id: 2), Item(id: 3)]
      ));
    
    // Found item 2.                
    await store.dispatchAndWait(SelectItem(2));    
    expect(store.state.selected, 2);
    
    // Failed to find item 42.
    var status = await store.dispatchAndWait(SelectItem(42));    
    expect(status.originalError, isA<>(UserException));
});
```

&nbsp;

# Advanced setup

If you are the Team Lead, you set up the app's infrastructure in a central place, 
and allow your developers to concentrate solely on the business logic.

You can add a `persistor` to save the state to the local device disk,
a `stateObserver` to collect app metrics, an `errorObserver` to log errors, 
an `actionObserver` to print information to the console during development, 
and a `globalWrapError` to catch all errors.
                 
```tsx
var store = Store<String>(
  initialState: '',
  persistor: MyPersistor(),
  stateObserver: [MyStateObserver()],
  errorObserver: [MyErrorObserver()],
  actionObservers: [MyActionObserver()],
  globalWrapError: MyGlobalWrapError(),
```
