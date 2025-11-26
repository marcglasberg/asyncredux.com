---
sidebar_position: 1
---

# Connector pattern

As previously discussed, you can [access the store state](../basics/using-the-store-state)
and [dispatch actions](../basics/dispatching-actions#dispatching-from-widgets) from any widget,
by using the extension methods on `BuildContext`:

```dart
var counter = context.state.counter;
var description = context.state.description;
context.dispatch(MyAction());
```

Let's assume you have a counter app, 
where the store state contains a `counter` integer, a `description` string,
and an `IncrementAction` that increments the counter.

```dart
// Widget that uses context.state directly
class CounterWidget extends StatelessWidget {
  Widget build(BuildContext context) {    
    return Column(
      children: [
        Text('Counter: ${context.state.counter}'), // Here!
        Text('Description: ${context.state.description}'), // Here!
        ElevatedButton(
          onPressed: () => context.dispatch(IncrementAction()), // Here!
          child: Text('Increment'),
          ),
        ],
      );
    }
```

Let's refactor this by removing all the store access from the widget. 
The widget will receive all the data it needs from the constructor:

```dart
class CounterWidget extends StatelessWidget {
  final int counter;
  final String description;
  final VoidCallback onIncrement;
    
  CounterWidget({
    required this.counter,
    required this.description,
    required this.onIncrement,
  });
    
  Widget build(BuildContext context) {    
    return Column(
      children: [
        Text('Counter: $counter'),
        Text('Description: $description'),
        ElevatedButton(
          onPressed: onIncrement,
          child: Text('Increment'),
        ),
      ],
    );
  }
}  
```

Finally, let's create a new "connector widget" that knows about the store and passes
down the data to the `CounterWidget` widget. We'll call this new widget `CounterConnector`:

```dart
class CounterConnector extends StatelessWidget {
  Widget build(BuildContext context) {
    final _counter = context.state.counter;
    final _description = context.state.description;
    final _onIncrement = () => context.dispatch(IncrementAction());
        
    return CounterWidget(
      counter: _counter,
      description: _description,
      onIncrement: _onIncrement,
      );
  }
}
```

This pattern where we separate the store access from the UI into two different widgets
is called the _connector pattern_.

Since the `CounterConnector` is "smart" (knows about the store), 
and the `CounterWidget` is "dumb" (doesn't know about where its data comes from),
the connector pattern is also called the _smart/dumb widget pattern_.                              

## Testing the dumb widget

Now, when you want to test the `CounterWidget`, you can do so by simply passing
the data it needs in the constructor, without having to create a Redux store.
For example:

```dart
testWidgets('Counter increments', (WidgetTester tester) async {
  int counter = 0;

  await tester.pumpWidget(
    MaterialApp(
      home: CounterWidget(
        counter: counter,
        description: 'Test description',
        onIncrement: () => counter++,
      ),
    ),
  );

  expect(find.text('Counter: 0'), findsOneWidget);
  expect(find.text('Description: Test description'), findsOneWidget);

  await tester.tap(find.text('Increment'));
  expect(counter, 1);
});
```

This is simpler than having to create a Redux store just to test the widget.

## Benefits of the connector pattern

The connector pattern provides several benefits:

1. **Easier testing**: You can test your UI widgets without creating a Redux store,
   by simply passing mock data and callbacks to the widget constructor.

2. **Separation of concerns**: Your UI widgets are concerned only with how things look,
   while your connector widgets are concerned with how things work.

3. **Reusability**: Your dumb widgets can be reused in different contexts,
   even outside of Redux, since they don't depend on the store.

4. **Cleaner code**: Your widget code is not cluttered with state access and transformation logic.
   All the store-related code is isolated in the connector.

