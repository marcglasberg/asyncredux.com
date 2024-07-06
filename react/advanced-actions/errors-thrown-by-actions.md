---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Errors thrown by actions

When your action runs, it may encounter problems. Examples include:

* A bug in your code
* A network request fails
* A database operation fails
* A file is not found
* A user types an invalid value in a form
* A user tries to log in with an invalid password
* A user tries to delete a non-existing item

In Async Redux, if your action encounters a problem, you are allowed to do the obvious thing
and simply **throw an error**. In this case, we say that the action "failed".

Async Redux has special provisions for dealing with errors thrown by actions,
including observing errors, showing errors to users, and wrapping errors into more meaningful
descriptions.

## What happens
                
As previously discussed, your actions can implement the
functions [`before()`](before-and-after-the-reducer#before),
[`reduce()`](../basics/actions-and-reducers#the-reducer),
and [`after()`](before-and-after-the-reducer#after).
This is what happens if an action throws an error:

* **Before**: If an action throws an error in its `before()` function, the reducer will not be
  executed, will not return a new state, and the store state will **not** be modified.

* **Reduce**: If an action throws an error in its `reduce()` function,
  the reducer will stop in its tracks before completing. It will not return a new state,
  and the store state will **not** be modified.

* **After**: The action's `after()` function will **always** be called, no matter if the other
  two functions threw errors or not. For this reason, if you need to clean up some action
  resources, you should do it here.

:::tip

And if at any point you need to know if and how the action failed,
you can check its [action status](./action-status).

:::

<br></br>

Now let's create an example to help us think about error handling in actions.

Here is a `LogoutAction` that checks if there is an internet connection,
in which case it deletes the app database, sets the store to its initial state,
and navigates to the login screen:

```ts
class LogoutAction extends Action {

  async reduce() {
    await this.checkInternetConnection();
    await this.deleteDatabase();
    this.dispatch(new NavigateToLoginScreenAction());
    
    return (state) => State.initialState();
  }
  
  async checkInternetConnection() { ... }  
  async deleteDatabase() { ... }
}
```

In the above code, suppose the `checkInternetConnection()` function checks if there is an
internet connection. If there isn't, it throws an error.
Here is the code
for <a href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine">React</a>
and <a href="https://www.npmjs.com/package/@react-native-community/netinfo">React Native</a>:

<Tabs>
<TabItem value="rw" label="React">

```ts
async checkInternetConnection() { 
  if (!navigator.onLine) {
    throw new NoInternetConnectionError();
  }  
}
```

</TabItem>
<TabItem value="rn" label="React Native">

```ts
async checkInternetConnection() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new NoInternetConnectionError();
  }
}
```

</TabItem>
</Tabs>

With this example in mind, let's explore our options.

## Local error handling

If your action throws some error,
you probably want to collect as much information as possible about it.
This can be useful for debugging, or for showing the user a more informative error message.

In the above code, if `checkInternetConnection()` throws an error,
you want to know that you have a connection problem,
but you also want to know this happened during the logout action.
In fact, you want all errors thrown by this action to reflect that.

The solution is overriding your action's **`wrapError()`** function.

It acts as a sort of "catch" statement of the action,
getting all errors thrown by the action.
You if you wish, this function can then return a new error to be thrown.
In other words:

* To modify the error, override the `wrapError()` function and return something.
* To keep the error the same, just return it unaltered, or don't override `wrapError()`.

Usually, you'll want to wrap the error inside another that better describes the failed action,
or contains more information. For example, this is how you could do it in the `LogoutAction`:

```ts
class LogoutAction extends Action {
  async reduce() {
    // ...
  }

  wrapError(error: any) {
    return new LogoutError("Logout failed", error);
  }
}
```

Note the `LogoutError` above includes the original error as a cause, so no information is lost.

## Showing a dialog to the user

Now suppose we want to show a dialog to the user, saying the logout failed, no matter
what the error was.

As [previously discussed](../basics/user-exceptions), 
throwing a `UserException` will automatically show a dialog to the user, 
where the dialog's message is the exception's message.

This is a possible solution, using `try/catch`:

```ts
class LogoutAction extends Action {

  async reduce() {
    try {
      await this.checkInternetConnection();
      await this.deleteDatabase();
    } catch (error) {
      throw new UserException('Logout failed', {hardCause: error});
    }
      
    this.dispatch(new NavigateToLoginScreenAction());    
    return (state) => State.initialState();
  }
}
```

However, you can achieve the same by overriding the `wrapError()` function:

```ts
class LogoutAction extends Action {

  async reduce() {
    await this.checkInternetConnection();
    await this.deleteDatabase();      
    this.dispatch(new NavigateToLoginScreenAction());    
    return (state) => State.initialState();
  }
  
  wrapError(error: any) {
    return new UserException('Logout failed', {hardCause: error});
  }  
}
```

## Creating a base action

You may also modify your [base action](./base-action-with-common-logic) to make it easier
to add this behavior to multiple actions:

```ts
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

export abstract class Action extends ReduxAction<State> {
  wrapErrorMessage = undefined;  
  
  wrapError(error) {
    if (this.wrapErrorMessage !== undefined)
      return new UserException(wrapErrorMessage(), {hardCause: error});
  }  
}
```

Now you can easily add the `wrapErrorMessage` function in all your desired actions,
to make sure all action errors are wrapped in a `UserException`:

```ts
class LogoutAction extends Action {

  wrapErrorMessage = () => 'The logout failed';
   
  async reduce() {
    await this.checkInternetConnection();
    await this.deleteDatabase();      
    this.dispatch(new NavigateToLoginScreenAction());    
    return (state) => State.initialState();
  }    
}
```

## Global error handling

Third-party code may also throw errors which should not be considered bugs,
but simply messages to be displayed in a dialog to the user.

For example, Firebase may throw some `PlatformException` errors
in response to a bad connection to the server.
In this case, it may be a good idea to convert this error into a `UserException`,
so that a dialog appears to the user with the error message.

There are two ways to do that. One of them we already discussed above:
Just convert it in the action itself
by implementing the optional `wrapError()` function:

```ts
class MyAction extends Action {
  
  wrapError(error: any) {
    if (error instanceof PlatformException 
      && error.code === "Error performing get" 
      && error.message === 'Failed to get document because the client is offline'
      ) {
      return new UserException('Check your internet connection').addCause(error);
    } else { 
      return error;
    }   
  }    
}
```

However, then you'd have to add this code to all actions that use Firebase.

A better way is providing it globally as the `globalWrapError` parameter, when you create the store:

```ts              
const store = createStore<State>(
  initialState: new State(),
  globalWrapError: globalWrapError,
);

function globalWrapError(error :any) {
  if (error instanceof PlatformException 
    && error.code === "Error performing get" 
    && error.message === 'Failed to get document because the client is offline'
    ) {
    return new UserException('Check your internet connection').addCause(error);
  } else { 
    return error;
  }
}    
```

The `globalWrapError` function will be given all errors,
and it's called **after** the action's own `wrapError()` function, if it exists.

It may then return a `UserException` which will be used instead of the original exception.
Otherwise, it just returns the original `error`, so that it will not be modified.
It may also return `null` to disable (swallow) the error.

:::tip

If instead of **returning** an error you **throw** an error inside the `globalWrapError`
function, AsyncRedux will catch this error and use it instead the original error. In other
words, returning an error or throwing an error works the same way. But it's recommended that
you return the error instead of throwing it anyway.

:::

:::note

Don't use the `globalWrapError` to log errors, as you should prefer doing that
in the global `errorObserver` that will be discussed below.

The `globalWrapError` is always called **before** the `errorObserver`.

:::

## Disabling errors

If you want your action to disable its own errors, locally,
the action's `wrapError()` function may simply return `null`.

For example, suppose you want to let all errors pass through, except for errors of
type `MyException`:

```ts
wrapError(error :any) { 
  return (error instanceof MyException) ? null : error;
}
```

If you want this to happen globally, use the `globalWrapError` instead:

```ts
const store = createStore<State>(
  initialState: new State(),
  globalWrapError: globalWrapError,
);

function globalWrapError(error :any) {
  return (error instanceof MyException) ? null : error;
}   
```

## Error observer

An `errorObserver` function can be set during the store creation.
This function will be given all errors that survive the action's `wrapError` and
the `globalWrapError`, including those of type `UserException`.

You also get the `action` and a reference to the `store`. IMPORTANT: Don't use the store to
dispatch any actions, as this may have unpredictable results.

The `errorObserver` is the ideal place to log errors, as you have all the information you may
need, including the `action` that dispatched the error, which you can use to log the action
name, as well as any action properties you may find interesting.

After you log the error, you may then return `true` to let the error throw,
or `false` to swallow it.

For example, if you want to disable all errors in _production_, but log them;
and you want to throw all errors during _development_ and _tests_, this is how you can do it:

```ts
const store = createStore<State>(
  initialState: new State(),
  errorObserver: errorObserver,
);

function errorObserver(error: any, action: Action, store: Store<State>) {

   // In development and tests, we throw the error so that we can 
   // see it in the emulator/console. We also always let UserExceptions 
   // pass through, so that they can be shown to the user.
   if (inDevelopment() || inTests() || (error instanceof UserException)) { 
     return true;
   }
   // In production, we log the error and swallow it by returning false.
   else {
     Logger.error(`Got ${error} in action ${action}.`);
     return false;
   }
}            
```

As you can see, the error observer returns a boolean:

* If it returns `true`, the error will be rethrown after the `errorObserver` finishes.

* If it returns `false`, the error is considered dealt with, and will be "swallowed" (not rethrown).
  This is usually what we want to do in production, after logging the error.

## UserExceptionAction

As [previously discussed](../basics/user-exceptions), the `UserException` is a special type of error
that Async Redux automatically catches and shows to the user in a dialog, or other UI of your
choice.

For this to work, you must throw the `UserException` from inside an
action's `before()` or `reduce()` functions. Only then, Async Redux will be able to
catch the exception and show it to the user.

However, if you are **not** inside an action, but you still want to show an error dialog to the
user, you may use the provided `UserExceptionAction`.

```ts
dispatch(UserExceptionAction('Please enter a valid number'));
```

This action simply throws a corresponding `UserException` from its own `reduce()` function.

The `UserExceptionAction` is also useful inside of actions themselves,
if you want to display an error dialog to the user,
but you don't want to interrupt the action by throwing an exception.

For example, here an invalid number will show an error dialog to the user,
but the action will continue running and set the counter state to `0`:

```ts
class ConvertAction {
  constructor(private text: string) {}

  reduce() {
    let value = parseInt(this.text);

    if (isNaN(value)) { 
      dispatch(new UserExceptionAction('Please enter a valid number'));
      value = 0;
    }  
    
    return { counter: value };
  }
}
```

