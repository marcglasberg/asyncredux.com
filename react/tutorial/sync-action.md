---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sync action

When the user types a new todo item in the `TodoInput` component and presses `Enter`,
the app dispatches the `AddToAction` action.

This action's payload is the string `text` of the new todo item.

```tsx title="AddTodoAction.ts"
export class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {
    let newTodos = this.state.todos.addTodoFromText(this.text);
    return this.state.withTodos(newTodos);
  }
}
```

As you can see above, the current state of the app is readily available in the `this.state`
property of the action. We need to modify it.

We then use the `addTodoFromText()` function defined in the `Todos` class to add the new todo item, 
and then use the `withTodos()` function to update the state with the new todos.

## If the item already exists

Let's now modify the `AddTodoAction` to check if the new todo item already exists in the list.
If it does, we throw a `UserException` with an error message:

```tsx title="AddTodoAction.ts"
export class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {
  
    // Check if the item already exists
    if (this.state.todos.ifExists(this.text)) {
      throw new UserException(
        `The item "${this.text}" already exists.`, {
          errorText: `Type something else other than "${this.text}"`
        });
    }

    let newTodos = this.state.todos.addTodoFromText(this.text);
    return this.state.withTodos(newTodos);
  }
}
```

In the code above, we use the `ifExists()` function defined in the `Todos` class to check if the
new todo item already exists in the list. When it does, we throw a `UserException` with an error
message. 

Throwing `UserException`s from action is ok. The app will not crash.
Async Redux will catch the exception and handle it properly:
          
* The action will not return a new state, and the store state will not be updated
* A dialog will pop up with the error message, automatically
* Components can check an error occurred by writing `useIsFailed(AddTodoAction)`
* Components can get a reference to the error itself by doing `useExceptionFor(AddTodoAction)`

In the next page, we will see how to handle this error in the `TodoInput` component.

## Note

In Async Redux, all actions must extend `ReduxAction<State>`, 
where `State` is the class that represents the state of your app.

In the code above, and for the rest of this tutorial, 
I'm assuming you have defined another base action class called simply `Action`
that extends `ReduxAction<State>`, and then have all your actions 
extend this `Action` class instead:

```tsx title="Action.ts"
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

export abstract class Action extends ReduxAction<State> {
}
```



