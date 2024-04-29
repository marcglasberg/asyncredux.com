---
sidebar_position: 1
---

# Dispatch, wait and expect

Testing involves waiting for an action to complete its dispatch process,
or for the store state to meet a certain condition. After this, you can verify the current
state or action using the
methods `store.dispatchAndWait`, `store.dispatchAndWaitAll`, `store.waitCondition`,
`store.waitActionCondition`, `store.waitAllActions`, `store.waitActionType`,
`store.waitAllActionTypes`, and `store.waitAnyActionTypeFinishes`. For example:

```dart
// Wait for some action to dispatch and check the state. 
await store.dispatchAndWait(MyAction());
expect(store.state.name, 'John')

// Wait for some action to dispatch, and check for errors in the action status. 
var status = await dispatchAndWait(MyAction());
expect(status.originalError, isA<UserException>());

// Dispatches two actions in SERIES (one after the other).
await dispatchAndWait(SomeAsyncAction());
await dispatchAndWait(AnotherAsyncAction());

// Dispatches two actions in PARALLEL and wait for their TYPES.
expect(store.state.portfolio, ['TSLA']);
dispatch(BuyAction('IBM'));
dispatch(SellAction('TSLA'));
await store.waitAllActionTypes([BuyAction, SellAction]);
expect(store.state.portfolio, ['IBM']);                

// Dispatches two actions in PARALLEL and wait for them.
let action1 = BuyAction('IBM');
let action2 = BuyAction('TSLA');
dispatch(action1);
dispatch(action2);
await store.waitAllActions([action1, action2]);
expect(store.state.portfolio.containsAll('IBM', 'TSLA'), isFalse);

// Another way to dispatch two actions in PARALLEL and wait for them.
await store.dispatchAndWaitAll([BuyAction('IBM'), BuyAction('TSLA')]);
expect(store.state.portfolio.containsAll('IBM', 'TSLA'), isFalse);

// Wait until no actions are in progress.
dispatch(BuyStock('IBM'));
dispatch(BuyStock('TSLA'));  
await waitAllActions([]);                 
expect(state.stocks, ['IBM', 'TSLA']);
     
// Wait for some action of a given type.
dispatch(ChangeNameAction()); 
var action = store.waitActionType(ChangeNameAction);
expect(action, isA<ChangeNameAction>());
expect(action.status.isCompleteOk, isTrue);
expect(store.state.name, 'Bill'); 

// Wait until any action of the given types finishes dispatching.
dispatch(BuyOrSellAction());   
var action = store.waitAnyActionTypeFinishes([BuyAction, SellAction]);  
expect(store.state.portfolio.contains('IBM'), isTrue);

// Wait for some state condition.
expect(store.state.name, 'John')               
dispatch(ChangeNameAction("Bill"));
var action = await store.waitCondition((state) => state.name == "Bill");
expect(action, isA<ChangeNameAction>());
expect(store.state.name, 'Bill');  
```  
