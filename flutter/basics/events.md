---
sidebar_position: 13
---

# Events

Some native Flutter widgets, such as `TextField` and `ListView`, 
manage their own state by using controllers.

```dart
// TextField example
TextEditingController controller = TextEditingController();
TextField(controller: controller);

// ListView example
ScrollController scrollController = ScrollController();
ListView(
  controller: scrollController,
  children: [ // list items...
);
```

When an action is dispatched, you might need to use a controller
to clear a text field or scroll a list view to the top.
Should these controllers be stored in the Redux state?
The answer is no.

There are also situations where no controller is involved, 
but you still need to perform a one time action 
such as opening a dialog or hiding the keyboard.

AsyncRedux solves these cases with the `Evt` class, which introduces *events*.
Events are single use notifications used to trigger side effects in widgets.
They differ from regular state values because once read they are automatically consumed,
so they only trigger once.

## Setting up

Make sure you included the following extension code in your app, as shown in
[Using the store state](./using-the-store-state):

```dart
extension BuildContextExtension on BuildContext {
  AppState get state => getState<AppState>();
  AppState read() => getRead<AppState>();
  R select<R>(R Function(AppState state) selector) => getSelect<AppState, R>(selector);
  R? event<R>(Evt<R> Function(AppState state) selector) => getEvent<AppState, R>(selector);
}
```

In special, note the `context.event` extension method
that you will use to consume events in your widgets.

## Creating events

Use the `Evt` suffix when naming events. 
For example, an event that clears text can be named `clearTextEvt`.

A boolean event is created with the `Evt()` constructor, with no value and no generic type.
In this case, the event returns **true** once, and then **false** on later calls.

```dart
var clearTextEvt = Evt();
```

Events can also hold a value of any type by using `Evt<T>(value)`.
In this case, the event returns the **value** once and **null** on later calls.

```dart
var changeNameEvt = Evt<String>("Mark");
var changeAgeEvt = Evt<int>(42);
```

### Declare spent events in the initial state

Declare the events in your state class and initialize them as "spent"
by using `Evt.spent()` or `Evt<T>.spent()`.

```dart
class AppState {
  final Evt clearTextEvt;
  final Evt<String> changeTextEvt;

  AppState({required this.clearTextEvt, required this.changeTextEvt});

  static AppState initialState() => AppState(
    clearTextEvt: Evt.spent(), // Here!
    changeTextEvt: Evt<String>.spent(), // Here!
  );
}
```

### Actions place unspent events in the state

Actions then create new unspent events, placing them in the state:

```dart
// Boolean event.
class ClearText extends AppAction {  
  AppState reduce() => state.copy(clearTextEvt: Evt()); // Here!
}                                                     

// Event with a String payload.
class ChangeText extends AppAction {    
  Future<AppState> reduce() async {
    String newText = await fetchTextFromApi();
    return state.copy(changeTextEvt: Evt<String>(newText)); // Here!
  }
}
```

## Using events

Use `context.event((state) => ...)` to consume the event in the widget `build` method.
It will get the value of the event only once, and then false/null on later calls:

```dart
Widget build(BuildContext context) {

  // Gets `true` once, then `false` on later calls.
  bool clearText = context.event((st) => st.clearTextEvt);
  if (clearText) controller.clear();

  // Gets the String value once, then `null` on later calls.
  String? newText = context.event((st) => st.changeTextEvt);
  if (newText != null) controller.text = newText;
  ...  
```

&nbsp;

> Note each event can be consumed by only one widget.
> If more than one widget must react to the same trigger, create separate events in the state.

Try running the:
[Evt Example](https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_event.dart).

<hr></hr>

This concludes the basics of AsyncRedux. You now know how to create and read the state,
dispatch actions to change the state, run asynchronous actions,
show spinners when actions are running, and error messages when they fail.
That is enough for you to be productive with AsyncRedux, and create your own apps with it.

However, if you want to become an advanced AsyncRedux user, continue reading the next sections.
The next one will cover advanced topics related to actions.

