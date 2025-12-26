---
sidebar_position: 8
---

# Action selectors

In Redux, selectors are functions that take the Redux store state 
and return a specific piece of data. 

Why selectors are useful:
* They can compute derived data.
* They hide the structure of the state, so components don't depend on how the state is organized.
* Selectors can be cached (or _memoized_) to avoid unnecessary recalculations.

## Example

Suppose we have the following app state:

```dart
class AppState {  
  List<Item> items;    
  Item? selectedItem;
  // ...
}

class Item {
  String id;
  // ...
}
```

And an action that selects an item by `id`:

```dart
class ViewItem extends AppAction {
  final int id;
  ViewItem(this.id);
    
  AppState reduce() {
    Item? item = state.items.firstWhereOrNull((item) => item.id == id);
    if (item == null) throw UserException('Item not found');
    return state.copy(viewedItem: item);
  }    
}
```

You would use it like this:

```dart
var item = Item('A'); 
dispatch(ViewItem(item));
```

Previously, in [Action simplification](../basics/action-simplification), we saw how to create an
**abstract** base action class `AppAction` to reduce boilerplate.

That same class can also be used to simplify state access:

```dart
abstract class AppAction extends ReduxAction<AppState> {

  // Getter shortcuts   
  List<Item> get items => state.items;
  Item get selectedItem => state.selectedItem;
  
  // Selectors 
  Item? findById(int id) => items.firstWhereOrNull((item) => item.id == id);
  Item? searchByText(String text) => items.firstWhereOrNull((item) => item.text.contains(text));
  int get selectedIndex => items.indexOf(selectedItem);  
}
```

Now your actions can read the store more directly:

```dart
class ViewItem extends AppAction {
  final int id;
  ViewItem(this.id);
    
  AppState reduce() {
    Item? item = findById(id); // Here!
    if (item == null) throw UserException('Item not found');
    return state.copy(viewedItem: item);
  }    
}
```

Instead of writing:

```dart
Item? item = state.items.firstWhereOrNull((item) => item.id == id); 
```

You can simply write:

```dart
Item? item = findById(id);
```

In practice, your base action class may end up with many useful selectors
that all your actions can use.
           
## Creating a separate selector class

Another option is to create a `ActionSelect` class and link it to your base action.
This helps keep your base action cleaner.

First, define a `ActionSelect` class:

```dart
class ActionSelect {
  final AppState state;
  ActionSelect(this.state);
  
  // Getter shortcuts   
  List<Item> get items => state.items;
  Item get selectedItem => state.selectedItem;
  
  // Selectors   
  Item? findById(int id) => items.firstWhereOrNull((item) => item.id == id);  
  Item? searchByText(String text) => items.firstWhereOrNull((item) => item.text.contains(text));  
  int get selectedIndex => items.indexOf(selectedItem);  
}
```

Then link it in your base action:

```dart
abstract class AppAction extends ReduxAction<AppState> {
  ActionSelect get select => ActionSelect(state);    
}
```

Here's how you use it in your action:

```dart
class ViewItem extends AppAction {
  final int id;
  ViewItem(this.id);
    
  AppState reduce() {
    Item? item = select.findById(id); // Here!
    if (item == null) throw UserException('Item not found');
    return state.copy(viewed: item);
  }    
}
```

This also namespaces your selectors under select.
Your IDE should be able to auto complete them for you!

### Other usages

Selectors are not limited to actions. 
You can also use [widget selectors](../miscellaneous/widget-selectors).
                                                                 
