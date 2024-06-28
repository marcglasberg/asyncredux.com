---
sidebar_position: 12
---

# Wait, fail, succeed

A common pattern involves having a process that can either succeed or fail.
You want to display a spinner during the process, show the result when it completes,
and present an error message if it fails.

These are called "process states":

* **Waiting**: The process is currently running.
* **Failed**: The process failed with an error.
* **Succeeded**: The process succeeded.

In Async Redux, these processes start when actions are dispatched, which means we need a way to
know if an action is currently being processed, if it just failed, and eventually show an error.

Thankfully, this is very easy to do with Async Redux, by using the following store methods:

* `isWaiting(actionType)`: Returns true if the given action type is currently being processed.
* `isFailed(actionType)`: Returns true if the given action type just failed.
* `exceptionFor(actionType)`: Returns the exception that caused the action to fail.
* `clearExceptionFor(actionType)`: Clears the exception that caused the action to fail.

## In widgets

In widgets, we have access to those methods by using the built-in extension methods on
the `BuildContext` object.

We have already previously seen how to read the state and dispatch actions from widgets:

```dart
class MyWidget extends StatelessWidget {  
  Widget build(BuildContext context) {
    return Column(
      children: [
      Text('Counter: ${context.state.counter}'),
      ElevatedButton(
        onPressed: () => context.dispatch(IncrementAction()),
        child: Text('Increment'),
      ],
    );
}
```

Now, let's see how to show a spinner while an action is being processed, and show an error message.

## Show a spinner

Method `isWaiting(actionType)` returns true if the given action type is currently being
processed. By using this method, you can show a spinner while an action is being processed:

```dart
class MyWidget extends StatelessWidget {  
  Widget build(BuildContext context) {
    return context.isWaiting(IncrementAction) 
      ? CircularProgressIndicator(),
      : Text('Counter: ${context.state.counter}');
  }          
```

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_show_spinner.dart">Show Spinner Example</a>.
When you press the "+" button, it dispatches an increment action that
takes 2 seconds to finish. Meanwhile, a spinner is shown in the button, and the counter text gets
grey.

## Show an error message

Method `isFailed(actionType)` returns true if the given action type just failed.
By using this method, you can show an error message when an action fails:

```dart
class MyWidget extends StatelessWidget {  
  Widget build(BuildContext context) {
    if (context.isFailed(IncrementAction)) return Text('Loading failed');
    else return Text('Counter: ${context.state.counter}');
  }          
```

If the action failed with a `UserException`, you can get the exception by doing
`var exception = context.exceptionFor(actionType)` and then get the error message
to eventually show it in the UI.

```dart
class MyWidget extends StatelessWidget {  
  Widget build(BuildContext context) {
    if (context.isFailed(IncrementAction)) {
      var exception = context.exceptionFor(IncrementAction);
      return Text('Loading failed: ${exception.message}');
    }
    else return Text('Counter: ${context.state.counter}');
  }
```

## Combining `isWaiting` and `isFailed`

Let's suppose we've got an async action that gets a list of items from a server. You can show a
spinner while the action is being processed, and show an error message if the action fails:

```dart
class MyWidget extends StatelessWidget {  
  Widget build(BuildContext context) {
    if (context.isWaiting(GetItemsAction)) return CircularProgressIndicator();
    else if (context.isFailed(GetItemsAction)) return Text('Loading failed');
    else return ListView.builder(
      itemCount: context.state.items.length,
      itemBuilder: (context, index) => Text(context.state.items[index].name),
    );
  }          
```

Now let's repeat the previous code, but add a button (in a Column) that retries the action:

```dart
class MyWidget extends StatelessWidget {  
  Widget build(BuildContext context) {
    if (context.isWaiting(GetItemsAction)) return CircularProgressIndicator();
    else if (context.isFailed(GetItemsAction)) return Column(
      children: [
        Text('Loading failed'),
        ElevatedButton(
          onPressed: () => context.dispatch(GetItemsAction()),
          child: Text('Retry'),
        ),
      ],
    );
    else return ListView.builder(
      itemCount: context.state.items.length,
      itemBuilder: (context, index) => Text(context.state.items[index].name),
    );
  }          
```

As soon as the user presses the retry button, the spinner will be shown again, and the
error message will be cleared. This happens because the error message is cleared automatically when
the action is dispatched again.

You can always clear the error message explicitly by
calling `context.clearExceptionFor(actionType)`, but it's not necessary to do so before
dispatching the action again.

<hr></hr>

This concludes the basics of Async Redux. You now know how to create and read the state,
dispatch actions to change the state, run asynchronous actions,
show spinners when actions are running, and error messages when they fail.
That is enough for you to be productive with Async Redux, and create your own apps with it.

However, if you want to become an advanced Async Redux user, continue reading the next sections.
The next one will cover advanced topics related to actions.
