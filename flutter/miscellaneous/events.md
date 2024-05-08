---
sidebar_position: 4
---

# Events

In a real Flutter app it's not practical to assume that a Redux store can hold all the
application state. Widgets like `TextField` and `ListView` make use of controllers, which hold
state, and the store must be able to work alongside these.

For example, in response to the dispatching of some action you may want to clear a text-field, or
you may want to scroll a list-view to the top. Even when no controllers are involved,
you may want to execute some one-off processes, like opening a dialog or closing the keyboard,
and it's not obvious how to do that in Redux.

Async Redux solves these problems by introducing the concept of "events" and providing
the `Event` class.

## Creating events

The naming convention is that events are named with the `Evt` suffix.

Boolean events can be created like this:

```dart
var clearTextEvt = Event();
```

But you can have events with payloads of any other data type. For example:

```dart
var changeTextEvt = Event<String>("Hello");
var myEvt = Event<int>(42);
```

Events should be created in the initial store state as "spent",
by calling its `spent()` constructor:

```dart
static AppState initialState() {
  return AppState(
	clearTextEvt: Event.spent(),
	changeTextEvt: Event<String>.spent(),
}
```

## Using events

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
	  ));
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
    onClear: () => dispatch(ClearTextAction()),
  );
	  
  ViewModel({
    required this.initialText,
	required this.clearTextEvt,
	required this.changeTextEvt,
  }) : super(equals: [initialText, clearTextEvt, changeTextEvt]);
}

class ClearTextAction extends ReduxAction<AppState> {  
  AppState reduce() => state.copy(changeTextEvt: Event());
}

class ChangeTextAction extends ReduxAction<AppState> {
  String newText;
  ChangeTextAction(this.newText);
    
  AppState reduce() => state.copy(changeTextEvt: Event<String>(newText));
}
```

As you can see above, the dumb-widget gets the events as constructor parameters.

It will then "consume" the events in its `didUpdateWidget` method,
and do something with the event payload:

```dart
void didUpdateWidget(MyWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  consumeEvents();
}

void consumeEvents() {
  if (widget.clearTextEvt.consume()) { // Do something }

  var payload = widget.changeTextEvt.consume();
  if (payload != null) { // Do something }
}
```

The `evt.consume()` will return the payload once, and then that event is considered "spent".

In more detail, if the event **has no value and no generic type**, then it's a boolean event.
This means `evt.consume()` returns **true** once, and then **false** for subsequent calls.

However, if the event **has value or some generic type**, then `Event.consume()` returns the 
**value** once, and then **null** for subsequent calls.

So, for example, if you use a `controller` to hold the text in a `TextField`:

```dart
void consumeEvents() {

    var clearText = widget.clearTextEvt.consume();
    
	if (clearText)
	  WidgetsBinding.instance.addPostFrameCallback((_) {
		if (mounted) controller.clear();
	  });

	String newText = widget.changeTextEvt.consume();
	
	if (newText != null)
	  WidgetsBinding.instance.addPostFrameCallback((_) {
		if (mounted) controller.value = controller.value.copyWith(text: newText);
	  });
  }
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_event_redux.dart">
Event Example</a>.

<br></br>

# FAQ

### Since events are mutable, can I really put them in the store state?

Events are mutable, and store state is supposed to be immutable. Won't this create problems? No!
Don't worry, events are used in a contained way, and were crafted to play well with the Redux
infrastructure. In special, their `equals()` and `hashcode()` methods make sure no unnecessary
widget rebuilds happen when they are used as prescribed.

You can think of events as piggybacking in the Redux infrastructure, 
and not belonging to the store state. 
You should just remember **not to persist them** when you save the store state to the local disk.

### When should I use events?

The short answer is that you'll know it when you see it. When you want to do something, and it's not
obvious how to do it by changing regular store state, it's probably easy to solve it if you try
using events instead.

However, we can also give these guidelines:

1. You may use regular store state to pass constructor parameters to both stateless and stateful
   widgets.
2. You may use events to change the internal state of stateful widgets, after they are built.
3. You may use events to make one-off changes in controllers.
4. You may use events to make one-off changes in other implicit state like the open state of dialogs
   or the keyboard.

## Advanced event features

There are some advanced event features you may not need, but you should know they exist:

1. Methods `isSpent`, `isNotSpent` and `state`

   Methods `isSpent` and `isNotSpent` tell you if an event is spent or not, without consuming the
   event. Method `state` returns the event payload, without consuming the event.

2. Constructor `Event.map(Event<dynamic> evt, T Function(dynamic) mapFunction)`

   This is a convenience factory to create an event which is transformed by some function that,
   usually, needs the store state. You must provide the event and a map-function. The map-function
   must be able to deal with the spent state (`null` or `false`, accordingly).

   For example, if `state.indexEvt = Event<int>(5)` and you must get a user from it:

   ```dart
   var mapFunction = (index) => index == null ? null : state.users[index];
   Event<User> userEvt = MappedEvent<int, User>(state.indexEvt, mapFunction);
   ```  

3. Constructor `Event.from(Event<T> evt1, Event<T> evt2)`

   This is a convenience factory method to create `EventMultiple`, a special type of event which
   consumes from more than one event. If the first event is not spent, it will be consumed, and the
   second will not. If the first event is spent, the second one will be consumed. So, if both events
   are NOT spent, the method will have to be called twice to consume both. If both are spent,
   returns `null`.

4. Method `static T consumeFrom<T>(Event<T> evt1, Event<T> evt2)`

   This is a convenience static method to consume from more than one event. If the first event is
   not spent, it will be consumed, and the second will not. If the first event is spent, the second
   one will be consumed. So, if both events are NOT spent, the method will have to be called twice
   to consume both. If both are spent, returns `null`. For example:

    ```dart
    String getMessageEvt() => Event.consumeFrom(firstMsgEvt, secondMsgEvt);
    ```
