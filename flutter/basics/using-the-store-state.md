---
sidebar_position: 3
---

# Using the store state

Copy the following extension code to the same file where you defined the state class of your application, `AppState`:

```dart
extension BuildContextExtension on BuildContext {
  R select<R>(R Function(AppState st) selector) => getSelect<AppState, R>(selector);
  AppState read() => getRead<AppState>();
  R? event<R>(Evt<R> Function(AppState st) selector) => getEvent<AppState, R>(selector);
}
```

If you named your state class something else than `AppState`,
make sure to replace all occurrences of `AppState` in the code above
with the actual name of your state class.

## context.select

Use `context.select` in `build` to subscribe to the state your widget renders.

```dart
Widget build(BuildContext context) {
  var name = context.select((st) => st.user.name);
  return Text('User name is $name');
}
```

Store updates rebuild this widget when the selected name changes.

## Multiple state parts

If you need more than one part of the state in a widget, you can use `context.select` multiple times:

```dart
Widget build(context) {
  var name = context.select((st) => st.user.name);
  var age = context.select((st) => st.user.age);
  
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

You can also put the selection in a [smart widget](./smart-and-presentational-widgets)
and pass the values to a separate presentation widget through its constructor.

## context.read

Use `context.read()` in callbacks such as `onPressed` and in `initState`. Each call reads
the current state without subscribing the widget.

```dart
class MyWidgetState extends State<MyWidget> {
  
  void initState() {
    super.initState();
    var userName = context.read().user.name; // Here!
    print('User name at initState: $userName');
  } 
  
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        var userAge = context.read().user.age; // Here!
        print('User age at button press: $userAge');
      },
      child: Text('Get User Age'),
    );
  }
}
```

## In short

| Method | Where to use it | Store updates |
| --- | --- | --- |
| `context.select()` | `build` and `didChangeDependencies` | Notifies the widget when the selected value changes |
| `context.read()` | Callbacks and `initState` | Reads the current state at the time of the call |

<hr></hr>

Next, let's see how to define actions and reducers, that allow us to change the store state.
