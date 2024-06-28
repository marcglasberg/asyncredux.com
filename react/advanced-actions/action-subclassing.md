---
sidebar_position: 8
---

# Action Subclassing

Suppose we have the following app state:

```dart
class State {  
  List<Item> items;    
  int selectedItem;
}
```

And then we have an action, which selects an item by `id`:

```dart
class SelectItem extends Action {
  final int id;
  SelectItem(this.id);
    
  State reduce() {
    Item? item = state.items.firstWhereOrNull((item) => item.id == id);
    if (item == null) throw UserException('Item not found');
    return state.copy(selected: item);
  }    
}
```

You would use it like this:

```dart
var item = Item('A'); 
dispatch(SelectItem(newItem));
```

Since all actions extend `ReduxAction<State>`, you may use object-oriented principles to
reduce boilerplate. Start by creating an **abstract** base action class to allow easier access
to the sub-states of your store.

You could name is `BaseAction`, `AppAction` or any other name.
Here, we'll call it `Action`:

```dart
abstract class Action extends ReduxAction<State> {

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
class SelectItem extends Action {
  final int id;
  SelectItem(this.id);
    
  State reduce() {
    Item? item = findById(id);
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
extend `Action` instead of `ReduxAction<State>`.

<hr></hr>

This concludes the explanation of advanced action features.
You now know how to use `before()` and `after()` methods,
wrap the reducer, abort the action dispatch, handle action errors,
check actions status, and subclass actions.

The next section will explain how to uncouple accessing the store state, 
by using the connector pattern.
