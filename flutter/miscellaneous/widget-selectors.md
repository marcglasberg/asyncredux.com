---
sidebar_position: 8
---

# Widget Selectors

In Redux, selectors are functions that take the Redux store state
and return a specific piece of data.

Why selectors are useful:
* They can compute derived data.
* They hide the structure of the state, so components don't depend on how the state is organized.
* Selectors can be _cached_ (or _memoized_) to avoid unnecessary recalculations.
                 
We have previously seen in [Action Selectors](../advanced-actions/action-selectors.md) how to create simple selectors
to retrieve parts of the state, and to make them accessible from your **actions**.

However, selectors are also very useful in **widgets**, to retrieve the data they need from the store.

## BuildContext extension 

As [previously discussed](../basics/using-the-store-state.md), 
you should have already added an extension on `BuildContext` to your code.
Here we suggest you add an extra line:

```dart
extension BuildContextExtension on BuildContext {
  AppState get state => getState<AppState>();
  AppState read() => getRead<AppState>();
  R select<R>(R Function(AppState state) selector) => getSelect<AppState, R>(selector);
  R? event<R>(Evt<R> Function(AppState state) selector) => getEvent<AppState, R>(selector);
  
  // Add this:
  WidgetSelect get selector => WidgetSelect(BuildContext context);
}
```

Then, as an example, you could define a `WidgetSelect` class like this:

```dart
class WidgetSelect {
  final BuildContext context;
  WidgetSelect(this.context);
  
  // Getter shortcuts   
  List<Item> get items => context.select((st) => st.items);
  Item get selectedItem => context.select((st) => st.selectedItem);
  
  // Selectors   
  Item? findById(int id) => context.select((st) => st.items.firstWhereOrNull((item) => item.id == id));  
  Item? searchByText(String text) => context.select((st) => st.items.firstWhereOrNull((item) => item.text.contains(text)));  
  int get selectedIndex => context.select((st) => st.items.indexOf(st.selectedItem));  
}
```

Note the use of `context.select(...)` to access the store state. 
This ensures that the widget will only rebuild 
when the selected part of the state changes.

To use the selector in your widget, do this:

```dart
Widget build(BuildContext context) {  
  final item = context.selector.findById(id);
  ...
}
```

**Important notes:**

* Avoid using `context.state` inside your selectors, as that would cause the widget to
  rebuild every time *any* part of the state changes, defeating the purpose of using selectors.

* You also cannot use `context.select` inside another `context.select`, as that would
  cause an error. Always use `context.select` only at the top level of your selector methods.
  That's why in the example above we use `context.select((st) => st.items.firstWhereOrNull(...))`
  instead of `context.select((st) => items.firstWhereOrNull(...))`.

## Reusing Action selectors

Depending on the project, the selectors you need in your actions and in your widgets
may be very different, or very similar.

If you want, your widget selectors can easily reuse the action selectors:

```dart
class WidgetSelect {
  final BuildContext context;
  WidgetSelect(this.context);  
  
  // Getter shortcuts   
  List<Item> get items => context.select((st) => st.items);
  Item get selectedItem => context.select((st) => st.selectedItem);
  
  // Selectors   
  Item? findById(int id) => context.select((st) => ActionSelect(st).findById(id));  
  Item? searchByText(String text) => context.select((st) => ActionSelect(st).searchByText(text));  
  int get selectedIndex => context.select((st) => ActionSelect(st).selectedIndex(st.selectedItem));  
}
```

## StoreConnector selectors

If you use `StoreConnector`s in your project, 
you may add selectors to your base `Factory` class as well.
