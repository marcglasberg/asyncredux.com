---
sidebar_position: 4
---

# Testing widget lifecycle

Use a stateful widget to dispatch actions when a screen enters or leaves the widget tree.
For example, a screen can start polling in `initState` and stop in `dispose`.

Keep the callbacks bound to the store before passing them to the widget. The stop callback
can then dispatch during disposal without looking up an inherited widget.

```dart
class PollingScreen extends StatefulWidget {
  PollingScreen({
    required this.onStart,
    required this.onStop,
    super.key,
  });

  final VoidCallback onStart;
  final VoidCallback onStop;

  @override
  State<PollingScreen> createState() => _PollingScreenState();
}

class _PollingScreenState extends State<PollingScreen> {
  @override
  void initState() {
    super.initState();
    widget.onStart();
  }

  @override
  void dispose() {
    widget.onStop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Text('Polling information');
}
```

When you create the screen, pass callbacks wired to your polling action.

```dart
PollingScreen(
  onStart: () => store.dispatch(PollInformationAction(true)),
  onStop: () => store.dispatch(PollInformationAction(false)),
)
```

In a widget test, mount the screen and then replace it. The test can record the callbacks
directly. Test what the polling action does separately using the store.

```dart
testWidgets('Polling starts on mount and stops on removal', (tester) async {
  final calls = <String>[];

  await tester.pumpWidget(
    MaterialApp(
      home: PollingScreen(
        onStart: () => calls.add('start'),
        onStop: () => calls.add('stop'),
      ),
    ),
  );
  expect(calls, ['start']);

  await tester.pumpWidget(SizedBox.shrink());
  expect(calls, ['start', 'stop']);
});
```
