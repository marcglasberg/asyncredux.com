---
sidebar_position: 2
---

# Advanced waiting

It is common to show a visual hint that an important process is running and should finish soon. 
Examples include:

* A save button showing a [spinner](https://api.flutter.dev/flutter/material/CircularProgressIndicator-class.html)
  while saving.

* A `Text("Please wait...")` on screen while something is being calculated.

* A <a href="https://pub.dev/packages?q=shimmer">shimmer</a> used as a placeholder while data loads.

* A modal barrier that blocks user interaction while a screen opens.

<br></br>

In [Wait, fail, succeed](/flutter/basics/wait-fail-succeed.md) I explain that the easiest way to handle this is to use:

* `isWaiting(MyAction)` in actions
* `context.isWaiting(MyAction)` in widgets

Here, `MyAction` is the async action that runs the process you are waiting for. 
This approach is very easy to use and fits most situations.

If you find a case where `isWaiting()` is not enough, keep reading.

## WaitAction and Wait

In [Before and After the Reducer](/flutter/advanced-actions/before-and-after-the-reducer.md) section I show
how to manually create a `BarrierAction` with a boolean flag used to add or remove a modal 
barrier in the screen (see the
code <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_before_and_after.dart">here</a>).

However, keeping track of many such boolean flags may be difficult to do.
An option is using the built-in classes `WaitAction` and `Wait`.

To use them, your store state must have a `Wait` field named `wait`, and then your state class
must have a `copy` or `copyWith` method which copies this field as a named parameter. For example:

```dart
class AppState {
  final Wait wait;
  ...  
  AppState({this.wait, ...});
  AppState copy({Wait wait, ...}) => AppState(wait: wait ?? this.wait, ...);
  }
```

Then, when you want to start waiting, 
dispatch a `WaitAction` and pass it some immutable object to act as a flag. 
When you finish waiting, remove the flag.
For example:

```dart
dispatch(WaitAction.add("my flag")); // To add a flag.   
dispatch(WaitAction.remove("my flag")); // To remove a flag.   
```

You can then use this "wait state" in your actions and widgets:

* `state.wait.isWaitingAny` returns `true` if there's any waiting whatsoever.
* `state.wait.isWaiting(flag)` returns `true` if you are waiting for a specific `flag`
* `state.wait.isWaiting(flag, ref: reference)` returns `true` if you are waiting for a
  specific `reference` of the `flag`.
* `state.wait.isWaitingForType<T>()` returns `true` if you are waiting for any flag of type `T`.

### Flag types

The flag can be any convenient **immutable object**, like a URL, a user id, an index, an enum, 
a String, a number, or other.

As an example, if we want to replace the `isWaiting()` method with the `Wait` object, we
could do the following: 

```dart
class LoadAction extends AppAction {

  Future<AppState> reduce() async {    
    var newText = await loadText(); 
    return state.copy(text: newText);
  }
  
  void before() => dispatch(WaitAction.add(this)); // Here!
  void after() => dispatch(WaitAction.remove(this)); // Here!
}
```

Then, in the widget:

```dart
if (wait.isWaitingForType<LoadAction>()) { // Show the button as disabled }
else { // Show the button as enabled }
```

Note: You may also define a **mixin** to implement the waiting:

```dart
mixin WithWaitState implements ReduxAction<AppState> {
  void before() => dispatch(WaitAction.add(this));
  void after() => dispatch(WaitAction.remove(this));
}  

class LoadAction extends AppAction with WithWaitState {
  Future<AppState> reduce() async {    
    var newText = await loadText(); 
    return state.copy(text: newText);
  }
}
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_wait_action_simple.dart">Wait Action Simple Example</a>
(which is similar to the
<a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_before_and_after.dart">Before and After example</a>
but using the built-in `WaitAction`). It uses the action itself as the
flag, by passing `this`.

### Granular flags

A more advanced example is
the <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_wait_action_advanced_1.dart">Wait Action Advanced 1 Example</a>.
Here, 10 buttons are shown. When a button is clicked it will be
replaced by a downloaded text description. Each button shows a progress indicator while its
description is downloading. Also, the screen title shows the text `"Downloading..."` if any of the
buttons is currently downloading.

![](https://raw.githubusercontent.com/marcglasberg/async_redux/refs/heads/master/example/lib/images/waitAction.png)

The flag in this case is simply the index of the button, from `0` to `9`:

```dart
int index;
void before() => dispatch(WaitAction.add(index));
void after() => dispatch(WaitAction.remove(index));
```

If there's any waiting, then `state.wait.isWaitingAny` will return `true`. 
However, now you can check each button wait flag separately by its index, 
as `state.wait.isWaiting(index)` will return `true` only when that specific button is waiting.

If necessary, you can also clear all flags by doing `dispatch(WaitAction.clear())`.

### Wait references

If you fear your flag may conflict with others, you can also add a "namespace", by further dividing
flags into _references_. This can be seen in
the <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_wait_action_advanced_2.dart">Wait Action Advanced 2 Example</a>:

```dart
void before() => dispatch(WaitAction.add("button-download", ref: index));
void after() => dispatch(WaitAction.remove("button-download", ref: index));
```

Now, to check a button's wait flag, you must pass both the flag and the reference:
`state.wait.isWaiting("button-download", ref: index)`.

If necessary, you can clear all references of that flag with `dispatch(WaitAction.clear("button-download"))`.

You can also pass a _delay value_ to `WaitAction.add()` and `WaitAction.remove()` methods. Please refer to
their method documentation for more information.

## Third-party package support

How can I use Freezed, BuiltValue, or other similar code generator packages with the `WaitAction`?

In case you use
<a href="https://pub.dev/packages/built_value">built_value</a>
or <a href="https://pub.dev/packages/freezed">freezed</a> packages, the `WaitAction` works out-of-the-box with them. 
In both cases, you don't need to create the state's `copy` or `copyWith` methods by hand. 
But you still need to add the `Wait` object to the store state as previously described.

If you want to further customize `WaitAction` to work with other packages, or to use the `Wait`
object in different ways, you can do so by injecting your custom reducer into `WaitAction.reducer`
during your app's initialization. Refer to
the `WaitAction` <a href="https://github.com/marcglasberg/async_redux/blob/master/lib/src/wait_action.dart">
documentation</a> for more information.
