---
sidebar_position: 6
---

# Action Subclassing

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

And then we have an action, which selects an item by `id`:

```dart
class SelectItem extends AppAction {
  final int id;
  SelectItem(this.id);
    
  AppState reduce() {
    Item? item = state.items.firstWhereOrNull((item) => item.id == id);
    if (item == null) throw UserException('Item not found');
    return state.copy(selectedItem: item);
  }    
}
```

You would use it like this:

```dart
var item = Item('A'); 
dispatch(SelectItem(item));
```

Since all actions extend `ReduxAction<AppState>`, you may use object-oriented principles to
reduce boilerplate. Start by creating an **abstract** base action class to allow easier access
to the sub-states of your store.

You could name is `BaseAction`, `Action` or any other name.
Here, we'll call it `AppAction`:

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

And then your actions have an easier time accessing the store state:

```dart
class SelectItem extends AppAction {
  final int id;
  SelectItem(this.id);
    
  AppState reduce() {
    Item? item = findById(id); // Here!
    if (item == null) throw UserException('Item not found');
    return state.copy(selected: item);
  }    
}
```

The difference above is that, instead of writing:

```dart
Item? item = state.items.firstWhereOrNull((item) => item.id == id); 
```

You can simply write:

```dart
Item? item = findById(id);
```

It may seem a small reduction of boilerplate, but it adds up.

In practice, your base action class may end up containing a lot of elaborate "selector methods",
which then can be used by all your actions.

The only requirement is that your actions now
extend `AppAction` instead of `ReduxAction<AppState>`.
