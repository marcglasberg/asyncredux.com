---
sidebar_position: 7
---

# Aborting the dispatch

You may override the action's `abortDispatch()` function to completely prevent
running the action under certain conditions.

:::warning

This is a complex power feature that you may not need to learn.
If you do, use it with caution.
:::

In more detail, if function `abortDispatch()` returns `true`,
the action will not be dispatched: `before`, `reduce` and `after` will not be called.

# Example

```dart
class UpdateUserInfo extends Action {

  // If there is no user, the action will not run.
  abortDispatch() {
    return state.user === null;
  }

...
```

## Creating a base action

You may modify your [base action](./base-action-with-common-logic) to make it easier
to add this behavior to multiple actions:

```ts
export abstract class Action extends ReduxAction<State> {

  allowWhenLoggedOut = false;   
  
  abortDispatch() {
  
    // The action should abort if it's not allowed to run while 
    // the user is logged out, and the user is indeed logged out. 
    let shouldAbort = !allowWhenLoggedOut && (state.user === null);        
    
    if (shouldAbort) {      
      navigateToHomePage();              
      return true; // Abort the action.      
    }        
    else {           
      return false; // Don't abort the action.
    } 
  }  
}
```

Now, only actions with `allowWhenLoggedOut = true` will be able to run
when the user is logged out.

```ts
// This action to log in the user should 
// be able to run when the user is logged out.
class LogIn extends Action {
  allowWhenLoggedOut = true;         
  async reduce() { ... }
}

// This action that allows the user to send a message 
// should NOT be able to run when there is no user.
class SendMessage extends Action {           
  async reduce() { ... }
}
```

