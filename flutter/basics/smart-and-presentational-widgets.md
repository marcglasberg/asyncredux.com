---
sidebar_position: 10
---

# Smart and presentational widgets

A widget can select state and dispatch actions directly in its `build` method.
When you want to reuse the presentation or test it in isolation, move the store access into a
separate smart widget. The smart widget, also called a **connector**, 
selects data and passes it to the presentation widget through its constructor.

## Select data in the smart widget

Suppose `AppState` has a `counter` and a `description`, and `IncrementAction` increments
the counter. Use the `context.select` extension from
[Using the store state](./using-the-store-state) to subscribe to both fields.

```dart
// The smart widget is called a "Connector". 
class CounterConnector extends StatelessWidget {
  CounterConnector({super.key});

  @override
  Widget build(BuildContext context) {

    // The "vm" is the view-model. 
    // In other words, we select only the part of the state we want.
    var vm = context.select((st) => (
      counter: st.counter,
      description: st.description,
    ));

    // The "dumb" widget gets the selected information directly.     
    return CounterWidget(
      counter: vm.counter,
      description: vm.description,
      onIncrement: () => context.dispatch(IncrementAction()),
    );
  }
}
```

Store updates rebuild the connector when the counter or description changes. The callback
dispatches the action when the user taps the button.

## Pass values and callbacks to the presentation widget

`CounterWidget` just renders the arguments it receives.
It's called a "dumb widget" because it doesn't know about the app store at all.

```dart
class CounterWidget extends StatelessWidget {
  CounterWidget({
    required this.counter,
    required this.description,
    required this.onIncrement,
    super.key,
  });

  final int counter;
  final String description;
  final VoidCallback onIncrement;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Counter: $counter'),
        Text(description),
        ElevatedButton(
          onPressed: onIncrement,
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

## Handle missing data

In a screen with a nullable `user` field, the smart widget can select the user’s name
and render a placeholder until the name is available. The presentation widget can then
accept a non-nullable name.

```dart
Widget build(BuildContext context) {
  var name = context.select((st) => st.user?.name);
  if (name == null) return Text('No user selected');

  return UserDetails(name: name);
}
```

## Events in a smart widget

A smart widget can consume one-time events with `context.event`. In the example below, 
the smart widget owns the text controller and passes it, the label, and the clear callback 
to the presentation widget.

Assume `AppState` has an `editorLabel` field and the events from [Events](../basics/events).
Declare the clear event as `Evt<bool>` and emit it with `Evt<bool>(true)`.

```dart
// This is the "smart" widget, named "Connector".
class TextEditorConnector extends StatefulWidget {
  TextEditorConnector({super.key});

  @override
  State<TextEditorConnector> createState() => _TextEditorConnectorState();
}

class _TextEditorConnectorState extends State<TextEditorConnector> {
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    var label = context.select((st) => st.editorLabel);
    bool? clear = context.event((st) => st.clearTextEvt);
    var text = context.event((st) => st.changeTextEvt);

    if (clear == true || text != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _controller.text = text ?? '';
      });
    }

    return TextEditor(
      label: label,
      controller: _controller,
      onClear: () => context.dispatch(ClearText()),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

// This is the "dumb" widget.
class TextEditor extends StatelessWidget {
  TextEditor({
    required this.label,
    required this.controller,
    required this.onClear,
    super.key,
  });

  final String label;
  final TextEditingController controller;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: controller,
          decoration: InputDecoration(labelText: label),
        ),
        TextButton(onPressed: onClear, child: Text('Clear')),
      ],
    );
  }
}
```

The controller updates after the frame, when the field can be notified safely.
If a clear and a text change are consumed in the same build, the new text takes
precedence. 

## Test the presentation widget

Pass fixed values and a callback through the constructor. This tests rendering and user
interaction without setting up a store.

```dart
testWidgets('CounterWidget renders its values and calls onIncrement', (tester) async {
  var incrementCalls = 0;

  await tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: CounterWidget(
          counter: 3,
          description: 'Test description',
          onIncrement: () => incrementCalls++,
        ),
      ),
    ),
  );

  expect(find.text('Counter: 3'), findsOneWidget);
  expect(find.text('Description: Test description'), findsOneWidget);

  await tester.tap(find.text('Increment'));
  expect(incrementCalls, 1);
});
```

To test the wiring as well, mount `CounterConnector` under a `StoreProvider` with a test
store. Tap **Increment**, pump the widget, and assert that both the store and the text
show the updated count. See [Test files](../testing/test-files) for how these tests fit
with action tests.
