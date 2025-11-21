---
sidebar_position: 3
---

# Using the store state

Copy the following extension code to the same file where you defined the state class of your application, `AppState`:

```dart
extension BuildContextExtension on BuildContext {
  AppState get state => getState<AppState>();
  AppState read() => getRead<AppState>();
  R select<R>(R Function(AppState state) selector) => getSelect<AppState, R>(selector);
  R? event<R>(Evt<R> Function(AppState state) selector) => getEvent<AppState, R>(selector);
}
```

If you named your state class something else than `AppState`,
make sure to replace all occurrences of `AppState` in the code above
with the actual name of your state class.

## context.state

Once you defined the above extensions, you can access your state from any widget by simply using `context.state`
in the `build` method. For example:

```dart
Widget build(context) {
  return Text('User name is ' + context.state.user.name);
}
```

All widgets that use `context.state` will automatically rebuild whenever the store state changes.

## context.select

Alternatively, you can use `context.select` to only select a specific part of the state. For example:

```dart
Widget build(context) {
  final name = context.select((state) => state.user.name);
  return Text('User name is $name');
}
```

While both approaches are valid, using `context.select` is more efficient,
as it only rebuilds the widget when the selected part of the state changes.

You can always start with `context.state` and later optimize it by switching to `context.select` only if needed.

## Multiple state parts

If you need more than one part of the state in a widget, you can use `context.select` multiple times:

```dart
Widget build(context) {
  final name = context.select((st) => st.user.name);
  final age = context.select((st) => st.user.age);
  
  return Text('User $name is $age years old');
}
```

Or you can use [Dart records](https://dart.dev/language/records):

```dart
Widget build(context) {

  var state = context.select((st) => (
     name: st.user.name,
     age: st.user.age),
  );

  return Text('User ${state.name} is ${state.age} years old');
}
```

## context.read

When you only need to read the state once and don't want the widget to rebuild when the state changes,
you can use `context.read()`. You generally use this in event handlers, like button `onPressed` callbacks,
and also in the `initState` method of stateful widgets. For example:

```dart
class MyWidgetState extends State<MyWidget> {
  
  void initState() {
    super.initState();
    final userName = context.read().user.name; // Here!
    print('User name at initState: $userName');
  } 
  
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        final userAge = context.read().user.age; // Here!
        print('User age at button press: $userAge');
      },
      child: Text('Get User Age'),
    );
  }
}
```

## In short

* `context.state` gets the full state and rebuilds on any change.
* `context.select()` gets only part of the state and rebuilds only when that part changes.
* `context.read()` reads the state once without triggering rebuilds.

**Where to use them:**

- `context.state` and `context.select()` belong in the `build` method.
- `context.read()` is used in event handlers and in the `initState` of stateful widgets.

**Summary table**

| Method             | Usage Location                         | Rebuilds on State Change?          |
|--------------------|----------------------------------------|------------------------------------|
| `context.state`    | `build` method                         | Yes, on any state change              |
| `context.select()` | `build` method                         | Yes, only when selected parts change |
| `context.read()`   | `initState` method, and event handlers | No                                 | 

<hr></hr>

Next, let's see how to define actions and reducers, that allow us to change the store state.
