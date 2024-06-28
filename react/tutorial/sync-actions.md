---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Synchronous actions

A **synchronous** action is a type of action that doesn't involve any asynchronous operations.

It cannot involve any network requests, file system operations, or any other kind of asynchronous
operation.

## AddToAction

As we've seen, when the user types a new todo item in the `TodoInput` component and
presses `Enter`, the app dispatches the `AddToAction` action:

```tsx
store.dispatch(new AddTodoAction(text));
```

The action payload is the `text` of the new todo item:

```tsx
class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }
}
```

All actions must also contain a `reduce()` function,
which has access to the current state of the app and returns a new state.

In our example, this new state will have **current the todo list** with the **new todo item** added
to it.

The current todo list is readily available in the `reduce()` function
through `this.state.todoList`:

```tsx
class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {  
    let currentTodoList = this.state.todoList;
    ...
  }
}
```

Since the current todo list is of type `TodoList`,
we can then use all functions from the `TodoList` class.
Let's [recap](./creating-the-state#todolist) the functions we've made available in that class:

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
Exactly what we want.

This is the resulting action code:

```tsx
class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {
    let currentTodoList = this.state.todoList;
    let newTodoList = currentTodoList.addTodoFromText(this.text);
    
    return this.state.withTodoList(newTodoList);
  }
}
```

Note above we also used function `state.withTodoList()` to create a new state with the new todo
list, and then returned this new state from the reducer.

## What if the item already exists?

Let's now modify `AddTodoAction` to check if the new todo item being added
already exists in the list. If it does, we want to abort adding the new todo item,
and then show an **error message** to the user.

This can be accomplished by simply throwing a `UserException` with the error message.
See below:

```tsx
class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {
  
    let currentTodoList = this.state.todoList;
  
    // Check if the item already exists
    if (currentTodoList.ifExists(this.text)) {
      throw new UserException(
        `The item "${this.text}" already exists.`, {
          errorText: `Type something else other than "${this.text}"`
        });
    }

    let newTodoList = currentTodoList.addTodoFromText(this.text);
    return this.state.withTodoList(newTodoList);
  }
}
```

In the code above, we use the `ifExists` function defined in the `TodoList` class to check if the
new todo item already exists in the list. When it does, we throw a `UserException` with an error
message.

Throwing a `UserException` from inside actions is ok. The app will not crash!
Async Redux will catch the exception and handle it properly:

* The action will abort. The reducer will not return a new state, and the store state will not
  be updated
* A dialog will pop up with the error message, automatically
* Components can later check an error occurred by writing `useIsFailed(AddTodoAction)`
* Components can later get a reference to the error itself by doing `useExceptionFor(AddTodoAction)`

In the next page, we will see how the `TodoInput` component handles this error.

:::tip

All actions, sync or async, can be dispatched with the following functions:

* `dispatch` - Dispatches the action and returns immediately.
* `dispatchAndWait` - Dispatches the action and returns a `Promise` that resolves
  with a "status" that tells us if the action was successful or not.

Here's why the [TodoInput](the-basic-ui#todoinput) component actually uses `dispatchAndWait`
instead of `dispatch`:

```tsx
// Add the item if it's unique. Fails if its text is a duplicate
let status = await store.dispatchAndWait(new AddTodoAction(text));

// Only if the item was added, clear the input
if (status.isCompletedOk) setInputText('');
```

:::

## RemoveAllTodosAction

In the [previous page](the-basic-ui.md#removeallbutton)
we discussed the `RemoveAllButton` component, which dispatches a `RemoveAllTodosAction`
when clicked. This action needs to return the state with an empty todo list.

The [State](creating-the-state#state) class has a `withTodoList()` function that returns the
state with a given todo list, and the [TodoList](creating-the-state#todolist) class
has a static `TodoList.empty` todo list. We'll use both:

```tsx
class RemoveAllTodosAction extends Action {

  reduce() {
    return this.state.withTodoList(TodoList.empty);
  }
}
```

## Note

In Async Redux, all actions must extend `ReduxAction<State>`,
assuming `State` is the type that represents the state of your app.

In the code above, and for the rest of this tutorial,
I'm assuming you have defined your own base action class called simply `Action`
that extends `ReduxAction<State>`, and then have all your actions
extend this `Action` class instead.

This is how you would define the `Action` class:

```tsx 
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




