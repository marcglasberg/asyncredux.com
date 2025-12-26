---
sidebar_position: 4
---

# Advanced Events

We have previously discussed [how to use events](../basics/events) to interact with
controllers or run one-time actions in your app.

On this page we answer common questions and explore advanced event features.

## Questions

### Since events are mutable, can I really put them in the store state?

Events are mutable, and store state should be immutable. Does this cause problems? No.
Events are used in a controlled way and were designed to work well with the Redux setup.
Their `equals()` and `hashcode()` methods prevent any extra widget rebuilds, when used as intended.

You can think of events as piggybacking in the Redux infrastructure, not as part of the store state.
Just remember **not to persist them** when saving the app state to the local storage of the device.

### When should I use events?

Some guidelines:

1. Use events to update the internal state of stateful widgets, after they are built.
2. Use events for one-off controller actions, like clearing text, changing focus, scrolling, or triggering an animation.
3. Use events for one-off implicit UI state, like opening dialogs, showing snackbars, toggling the keyboard,
   or navigating.
4. If you need to read the same value more than once, it should probably be regular store state, not an event.
5. Also use regular store state when widgets need to access state that's external to them.

But the short answer is that you'll know it when you see it. When you want something to happen,
and it's not clear how to do it with regular store state, events are often the easier way to solve it.

## Advanced features

There are some advanced event features you may not need, but you should know they exist:

1. Methods `isSpent`, `isNotSpent` and `state`

   Methods `isSpent` and `isNotSpent` tell you if an event has been consumed, without consuming it.
   Method `state` returns the payload without consuming the event.

2. Constructor `Event.map(Event<dynamic> evt, T Function(dynamic) mapFunction)`

   This creates an event transformed by a function that usually needs the store state.
   You must provide the event and a map function.
   The map function must handle the spent state (`null` or `false`).

   Example, if `state.indexEvt = Event<int>(5)` and you want to get a user from it:

   ```dart
   var mapFunction = (index) => index == null ? null : state.users[index];
   Event<User> userEvt = MappedEvent<int, User>(state.indexEvt, mapFunction);
   ```  

3. Constructor `Event.from(Event<T> evt1, Event<T> evt2)`

   This creates `EventMultiple`, which consumes from more than one event.
   If the first event is not spent, only that first one is consumed.
   If the first is spent, the second one is consumed.
   If both are not spent, call it twice to consume both.
   If both are spent, it returns `null`.

4. Method `static T consumeFrom<T>(Event<T> evt1, Event<T> evt2)`

   This static method consumes from more than one event. It follows the same rules as above. If both events are not
   spent, call it twice to consume both. If both are spent, it returns `null`.

    ```dart
    String getMessageEvt() => Event.consumeFrom(firstMsgEvt, secondMsgEvt);
    ```

## Using events in the StoreConnector

Events are accessible in the `StoreConnector` just like any other state:

```dart
class MyConnector extends StatelessWidget {
  
  Widget build(BuildContext context) {
    return StoreConnector<AppState, ViewModel>(
      vm: () => Factory(this),
      builder: (context, vm) => MyWidget(
      initialText: vm.initialText,
      clearTextEvt: vm.clearTextEvt,
      changeTextEvt: vm.changeTextEvt,
      onClear: vm.onClear,
      )
    );
  }
}

class ViewModel extends BaseModel<AppState> {
  String initialText;
  Event clearTextEvt;
  Event<String> changeTextEvt;  
  
  ViewModel fromStore() => ViewModel(
    initialText: state.initialText,
    clearTextEvt: state.clearTextEvt,
    changeTextEvt: state.changeTextEvt,
    onClear: () => dispatch(ClearText()),
  );

  ViewModel({
    required this.initialText,
    required this.clearTextEvt,
    required this.changeTextEvt,
  }) : super(equals: [initialText, clearTextEvt, changeTextEvt]);
}
           
// Boolean event.
class ClearText extends AppAction {  
  AppState reduce() => state.copy(changeTextEvt: Event());
}                                                     

// Event with a String payload.
class ChangeText extends AppAction {    
  Future<AppState> reduce() async {
    String newText = await fetchTextFromApi();
    return state.copy(changeTextEvt: Evt<String>(newText)); // Here!
  }
}
```

The dumb widget will then "consume" the events in its `didUpdateWidget` method,
and do something with the event payload:

```dart
void didUpdateWidget(MyWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  consumeEvents();
}

void consumeEvents() {

  // Consume the event that clears the text.
  // In this case the payload is a boolean.
  if (widget.clearTextEvt.consume()) { 
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) controller.clear();
      }); 
  }
                                    
  // Consume the event that changes the text.
  // In this case the payload is a String.
  String? payload = widget.changeTextEvt.consume();
  if (payload != null) { 
    WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) controller.value = controller.value.copyWith(text: newText);
      }); 
  }
}
```

The `Event.consume()` method will return the payload once, and then that event is considered "spent".

Try running the:
[Event Example](https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_event__store_connector.dart).

<br></br>
