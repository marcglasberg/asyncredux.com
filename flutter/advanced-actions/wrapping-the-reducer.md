---
sidebar_position: 11
---

# Wrapping the reducer

You may wrap an action reducer to allow for some pre- or post-processing.

:::warning
This is a power feature that you may not need to learn.
If you do, use it with caution.
:::

Actions allow you to override the `wrapReduce()` method,
that gets a reference to the action reducer as a parameter.
When overriding `wrapReduce()` it's up to you to call `reduce()` and
return a result.

In `wrapReduce()` you may run some code before and after the reducer runs,
and then change its result, or even prevent the reducer from running.

## Example

Imagine you have a chat application, where you can use the `SendMsg` action
to send messages of type `Msg`.

Each message has an `id`, as well as a `status` field that can be:

* `queued`: message was created in the client
* `sent`: message was sent to the server
* `received`: message was received by the recipient user

The action uses the service `service.sendMessage()` to send the queued message,
and then updates the message status to `sent`:

```dart
class SendMsg extends AppAction {
  final Msg msg;
  SendMsg(this.msg);      
 
  Future<AppState> reduce() async {
    await service.sendMessage(msg);
    return state.setMsg(msg.id, msg.copy(status: 'sent'));
  }
}
```

This mostly works, but there is a race condition.
The application is separately using websockets to listen to message updates from the server.
When the sent message is received by the recipient user, the websocket will let the
application know the message is now `received`.

If the message status is updated to `received` by the websocket before `service.sendMessage(msg)`
returns, the message status will be overwritten back to `sent` when the action completes.

One way to fix this is checking if the message status is already `received` before updating
it to `sent`. In this case, you abort the reducer.

This can be done in the reducer itself, by returning `null` to abort and avoid modifying the state:

```dart
class SendMsg extends AppAction {
  final Msg msg;
  SendMsg(this.msg);      

  Future<AppState> reduce() async {
    await service.sendMessage(msg);
    
    var currentMsg = state.getMsgById(msg.id);
    
    return (currentMsg.status === 'received')
      ? null;       
      : state.setMsg(msg.id, msg.copy(status: 'sent'));          
  }     
```

Another option is using `wrapReduce()` to wrap the reducer:

```dart
class SendMsg extends AppAction {
  final Msg msg;
  SendMsg(this.msg);      

  Reducer<St> wrapReduce(Reducer<St> reduce) => () async {
  
    // Get the message object before the reducer runs.  
    var previousMsg = state.getMsgById(msg.id);
    
    AppState? newState = await reduce();
    
    // Get the current message object, after the reducer runs.
    var currentMsg = state.getMsgById(msg.id);
      
    // Only update the state if the message object hasn't changed.  
    return identical(previousMsg, currentMsg) 
      ? newState 
      : null;          
  }

  Future<AppState> reduce() async {
    await service.sendMessage(msg);
    return state.setMsg(msg.id, msg.copy(status: 'sent'));          
  }  
}
```

## Creating a Mixin

You may also create a mixin to make it easier to add this behavior to multiple actions:

```dart
mixin AbortIfStateChanged on AppAction {
  
  abstract AppState getObservedState();
  
  Reducer<St> wrapReduce(Reducer<St> reduce) => () async {
  
    var previousObservedState = getObservedState();
    AppState? newState = await reduce();
    var currentObservedState = getObservedState();
    
    return identical(previousObservedState, currentObservedState) 
      ? newState 
      : null;
  }
}
```

Which allows you to write `with AbortIfStateChanged`:

```dart
class SendMsg extends AppAction with AbortIfStateChanged {
  final Msg msg;
  SendMsg(this.msg);     
  
  Future<AppState> reduce() async {
    await service.sendMessage(msg);
    return state.setMsg(msg.id, msg.copy(status: 'sent'));          
  }  
}
```

&nbsp;

<hr></hr>

This concludes the explanation of advanced action features.
You now know how to use `before()` and `after()` methods,
wrap the reducer, abort the action dispatch, handle action errors,
check actions status, and add selectors to your base action.

The next section will explain how to uncouple accessing the store state,
by using the connector (smart/dumb widget) pattern.
