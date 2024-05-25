---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Synchronous action

As we've seen, when the user types a new todo item in the `TodoInput` component and
presses `Enter`, the app dispatches the `AddToAction` action:

```tsx
store.dispatchAndWait(new AddTodoAction(text));
```

The action's payload is the `text` of the new todo item:

```tsx title="AddTodoAction.ts"
export class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }
}
```

All actions must also contain a `reduce()` function,
which has access to the current state of the app and returns a new state.
In this case, it must return a new todos list, equal to the current list plus the new todo item.

The current state of the app is readily available in the `reduce()` function
through the `this.state` property of the action.
From there, we get the current todo list with `this.state.todosList`:

```tsx title="AddTodoAction.ts"
export class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {  
    let currentTodosList = this.state.todosList;
    ...
  }
}
```

Since the current todo list is of type `TodosList`,
we can then use all functions from the `TodosList` class.
Let's [recap](./creating-the-state#todoslist) the available functions in that class:

* `addTodoFromText` - Add a new todo item to the list from a text string.
* `addTodo` - Add a new todo item to the list.
* `ifExists` - Check if a todo item with a given text already exists.
* `removeTodo` - Remove a todo item from the list.
* `toggleTodo` - Toggle the completed status of a todo item.
* `isEmpty` - Check if there are no todos that appear when a filter is applied.
* `iterator` - Allow iterating over the list of todos.
* `toString` - Return a string representation of the list of todos.
* `empty` - A static empty list of todos.

One of these functions is `addTodoFromText()`, which adds a new todo item to the list.

This is the resulting action code:

```tsx title="AddTodoAction.ts"
export class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {
    let currentTodosList = this.state.todosList;
    let newTodosList = currentTodosList.addTodoFromText(this.text);
    
    return this.state.withTodosList(newTodosList);
  }
}
```

Note we also used the `withTodosList()` function to update the state with the new todos list,
and then returned this new state.

## What if the item already exists?

Let's now modify `AddTodoAction` to check if the new todo item being added
already exists in the list. If it does, we want to abort adding the new todo item,
and then show an error message to the user.

This can be accomplished by simply throwing an `UserException` with an error message.
See below:

```tsx title="AddTodoAction.ts"
export class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {
  
    let currentTodosList = this.state.todosList;
  
    // Check if the item already exists
    if (currentTodosList.ifExists(this.text)) {
      throw new UserException(
        `The item "${this.text}" already exists.`, {
          errorText: `Type something else other than "${this.text}"`
        });
    }

    let newTodosList = currentTodosList.addTodoFromText(this.text);
    return this.state.withTodosList(newTodosList);
  }
}
```

In the code above, we use the `ifExists()` function defined in the `TodosList` class to check if the
new todo item already exists in the list. When it does, we throw a `UserException` with an error
message.

Throwing an `UserException` from inside actions is ok. The app will not crash!
Async Redux will catch the exception and handle it properly:

* The action will abort. The reducer will not return a new state, and the store state will not
  be updated
* A dialog will pop up with the error message, automatically
* Components can later check an error occurred by writing `useIsFailed(AddTodoAction)`
* Components can later get a reference to the error itself by doing `useExceptionFor(AddTodoAction)`

In the next page, we will see how to handle this error in the `TodoInput` component.

## Note

In Async Redux, all actions must extend `ReduxAction<State>`,
assuming `State` is the type that represents the state of your app.

In the code above, and for the rest of this tutorial,
I'm assuming you have defined your own base action class called simply `Action`
that extends `ReduxAction<State>`, and then have all your actions
extend this `Action` class instead.

This is how you would define the `Action` class:

```tsx title="Action.ts"
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

export abstract class Action extends ReduxAction<State> {
}
```

The reason to do this is twofold:

* First, you'll avoid writing `extends ReduxAction<State>` in every action class.
  Now, you'll need to write `extends Action` instead.

* And second, to have a common place to put any common logic that all your actions should have
  access to. More on that later.




