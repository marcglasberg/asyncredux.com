---
sidebar_position: 7
---

# Wrapping the reducer

You may wrap an action reducer to allow for some pre- or post-processing.

:::warning

This is a complex power feature that you may not need to learn.
If you do, use it with caution.
:::

Actions allow you to define a `wrapReduce()` function,
that gets a reference to the action reducer as a parameter.
If you override `wrapReduce()` it's up to you to call `reduce()` and
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

```ts
class SendMsg extends Action {
  constructor(private msg: Msg) { super(); }      
 
  async reduce() {
    await service.sendMessage(msg);
    return (state: State) => this.state.setMsg(msg.id, msg.copy(status: 'sent'));
  }
}
```

This mostly works, but there is a race condition.
The application is separately using websockets to listen to message updates from the server.
When the sent message is received by the recipient user, the websocket will let the
application know the message is now `received`.

If the message status is updated to `received` by the websocket before `service.sendMessage(msg)`
returns, the message status will be overwritten back to `sent` when the action completes.

One way to fix this, is checking if the message status is already `received` before updating
it to `sent`. In this case, you abort the reducer.

This can be done in the reducer itself, by returning `null` to abort and avoid modifying the state:

```ts
class SendMsg extends Action {
  constructor(private msg: Msg) { super(); }      
 
  async reduce() {    
    await service.sendMessage(msg);
    
    const currentMsg = this.state.getMsgById(msg.id);
    
    if (currentMsg.status === 'received')
      return null;       
    else 
      return (state) => this.state.setMsg(msg.id, msg.copy(status: 'sent'))          
  }
}
```

Another option is using `wrapReduce()` to wrap the reducer:

```ts
class SendMsg extends Action {
  constructor(private msg: Msg) { super(); }      

  async wrapReduce(reduce: () => ReduxReducer<St>)) {   
      
    // Get the message object before the reducer runs.  
    const previousMsg = this.state.getMsgById(msg.id);
    
    const newState = await reduce();
    
    // Get the current message object, after the reducer runs.
    const currentMsg = this.state.getMsgById(msg.id);
      
    // Only update the state if the message object hasn't changed.  
    return (previousMsg === currentMsg) 
      ? newState 
      : null;
  }
 
  async reduce() {    
    await service.sendMessage(msg);
    return (state) => this.state.setMsg(msg.id, msg.copy(status: 'sent'))            
  }
}
```

## Creating a base action

While wrapping the reducer may seem more work,
you may now modify your [base action](./base-action-with-common-logic) to make it easier
to add this behavior to multiple actions:

```ts
export abstract class Action extends ReduxAction<State> {
  observedState = undefined;  
  
  async wrapReduce(reduce: () => ReduxReducer<St>)) {
    if (observedState === undefined) {
      return reduce;
    }        
    
    let oldObservedState = this.observedState(this.state);    
    let newState = await reduce();
    let newObservedState = this.observedState(this.state);    
      
    return (oldObservedState === newObservedState) 
      ? newState 
      : null;
  }  
}
```

Now you can easily add the `observedState` function in all your desired actions,
to make sure the reducer is only applied if the observed state hasn't changed:

```ts
class SendMsg extends Action {
  constructor(private msg: Msg) { super(); }      

  observedState = (state :State) => this.state.getMsgById(msg.id); 
  
  async reduce() {    
    await service.sendMessage(msg);
    return (state) => this.state.setMsg(msg.id, msg.copy(status: 'sent'))            
  }
}
```
