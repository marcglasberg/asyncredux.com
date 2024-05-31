---
sidebar_position: 6
---

# Mixins

You can add **mixins** to your actions, to accomplish common tasks.

## Check for Internet connectivity

`CheckInternet` ensures actions only run with internet,
otherwise an **error dialog** prompts users to check their connection:

```dart
class LoadText extends Action with CheckInternet {
      
   Future<String> reduce() async {
      var response = await http.get('https://dummyjson.com/todos/1');
      ...      
   }
}   
```

`NoDialog` can be added to `CheckInternet` so that no dialog is opened.
Instead, you can display some information in your widgets:

```dart
class LoadText extends Action with CheckInternet, NoDialog { 
  ... 
  }

class MyWidget extends StatelessWidget {
  Widget build(context) {     
     if (context.isFailed(LoadText)) Text('No Internet connection');
  }
}   
```

`AbortWhenNoInternet` aborts the action silently (without showing any dialogs) if there is no
internet connection.

## NonReentrant

To prevent an action from being dispatched while it's already running,
add the `NonReentrant` mixin to your action class.

```dart
class LoadText extends Action with NonReentrant {
   ...
   }
```

## Retry

Add `Retry` to retry the action a few times with exponential backoff, if it fails.
Add `UnlimitedRetries` to retry indefinitely:

```dart
class LoadText extends Action with Retry, UnlimitedRetries {
   ...
   }
```

## Debounce (soon)

To limit how often an action occurs in response to rapid inputs, you can add the `Debounce` mixin
to your action class. For example, when a user types in a search bar, debouncing ensures that not
every keystroke triggers a server request. Instead, it waits until the user pauses typing before
acting.

```dart
class SearchText extends Action with Debounce {
  final String searchTerm;
  SearchText(this.searchTerm);
  
  final int debounce = 350; // Milliseconds

  Future<AppState> reduce() async {
      
    var response = await http.get(
      Uri.parse('https://example.com/?q=' + encoded(searchTerm))
    );
        
    return state.copy(searchResult: response.body);
  }
}
```

## Throttle (soon)

To prevent an action from running too frequently, you can add the `Throttle` mixin to your
action class. This means that once the action happens it's considered _fresh_, and it won't happen
again for a set period of time, even if you try to trigger it.
After this period ends, the action is considered _stale_ and is ready to be triggered again.

```tsx
class LoadPrices extends Action with Throttle {  
  
  final int throttle = 5000; // Milliseconds

  Future<AppState> reduce() async {      
    var result = await loadJson('https://example.com/prices');              
    return state.copy(prices: result);
  }
}
```

## OptimisticUpdate (soon)

To provide instant feedback on actions that save information to the server, this feature immediately
applies state changes as if they were already successful, before confirming with the server.
If the server update fails, the change is rolled back and, optionally, a notification can inform
the user of the issue.

```tsx
class SaveName extends Action with OptimisticUpdate { 
   
  async reduce() { ... } 
}
```
