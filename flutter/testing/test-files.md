---
sidebar_position: 7
---

# Test files

Test actions, the widget that connects the store to the UI, and presentation at the level
where each behavior lives. The [smart and presentational widgets](../basics/smart-and-presentational-widgets)
guide uses a counter to show this split.

1. **State test.** Create a store with a count of `0`, dispatch `IncrementAction`, and
   assert that the count becomes `1`.
2. **Smart widget test.** Mount `CounterConnector` under a `StoreProvider` with a test
   store. Tap **Increment**, pump the widget, and check both the store and the rendered
   count. This covers selection and dispatch together.
3. **Presentation test.** Mount `CounterWidget` with a fixed count, description, and a
   callback that records clicks. Assert what it renders and that pressing **Increment**
   calls the callback. This test can run without a store.

## Test the smart widget

Mount the counter with an isolated store and assert that dispatch updates the presentation.

```dart
testWidgets('CounterConnector dispatches and renders the new count', (tester) async {
  final store = Store<AppState>(
    initialState: AppState(counter: 0, description: 'Test description'),
  );

  await tester.pumpWidget(
    StoreProvider<AppState>(
      store: store,
      child: MaterialApp(
        home: Scaffold(body: CounterConnector()),
      ),
    ),
  );

  expect(find.text('Counter: 0'), findsOneWidget);
  await tester.tap(find.text('Increment'));
  await tester.pump();

  expect(store.state.counter, 1);
  expect(find.text('Counter: 1'), findsOneWidget);
});
```

## Naming convention

If your counter lives in `counter.dart`, you can use `counter_state_test.dart`,
`counter_connector_test.dart`, and `counter_widget_test.dart` for these three tests.
