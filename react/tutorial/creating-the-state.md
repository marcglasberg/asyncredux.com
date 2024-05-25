---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating the state

Our Todo app state will be composed of 3 data structures, named as follows:

* `TodoItem` represents a single todo item
* `TodoList` represents a list of `TodoItem`s
* `State` is the store state, which contain the `TodoList`

These can be plain JavaScript objects, but also classes.
I'll use classes in this tutorial.

## TodoItem

The `TodoItem` class represents a single todo item,
with some `text` and a `completed` status, which starts as false (not completed):

```tsx title="TodoItem.ts"
export class TodoItem {
  constructor(
    public text: string,
    public completed: boolean = false) { 
  }   
}
```

We'll add to it a `toggleCompleted()` function, which returns a copy of the item
with the same text, but opposite completed status:

```tsx title="TodoItem.ts"
export class TodoItem {
  constructor(
    public text: string,
    public completed: boolean = false) { 
  }   
  
  toggleCompleted() {
    return new TodoItem(this.text, !this.completed);
  }
}
```

This class is **immutable**, as it doesn't have any setters, and its single function returns
a new `TodoItem` object, instead of modifying the current one.

## TodoList

The `TodoList` class is a simple list of todo items of type `TodoItem`:

```tsx title="TodoList.ts"
export class Todos {  
  constructor(public readonly items: TodoItem[] = []) {}  
}
```

We can add of sorts of functions to the `TodoList` class, which will later help us manage the list
of todos. These are a few examples:

* `addTodoFromText` - Add a new todo item to the list from a text string.
* `addTodo` - Add a new todo item to the list.
* `ifExists` - Check if a todo item with a given text already exists.
* `removeTodo` - Remove a todo item from the list.
* `toggleTodo` - Toggle the completed status of a todo item.
* `isEmpty` - Check if there are no todos that appear when a filter is applied.
* `iterator` - Allow iterating over the list of todos.
* `toString` - Return a string representation of the list of todos.
* `empty` - A static empty list of todos.

Here is the full code of the `TodoList` class, with all the above functions implemented:

```tsx title="TodoList.ts"
export class TodoList {  
  constructor(public readonly items: TodoItem[] = []) {}  
  
  addTodoFromText(text: string): Todos {
    const trimmedText = text.trim();
    const capitalizedText = trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1);
    return this.addTodo(new TodoItem(capitalizedText));
  }
  
  addTodo(newItem: TodoItem): Todos {
    if ((newItem.text === '') || this.ifExists(newItem.text))
      return this;
    else
      return new TodoList([newItem, ...this.items]);
  }
  
  ifExists(text: string): boolean {
    return this.items.some(todo => todo.text === text);
  }
  
  removeTodo(item: TodoItem): Todos {
    return new TodoList(this.items.filter(itemInList => itemInList !== item));
  }
  
  toggleTodo(item: TodoItem): Todos {
    const newTodos = this.items.map(itemInList => (itemInList === item) ? item.toggleCompleted() : itemInList);
    return new TodoList(newTodos);
  }   
  
  isEmpty() {
    return this.items.length === 0;
  }

  * [Symbol.iterator]() {
    for (let i = 0; i < this.items.length; i++) {
      yield this.items[i];
    }
  }

  toString() { return `Todos{${this.items.join(',')}}`; }
  
  static empty: Todos = new TodoList();
}
```

Note again that all functions above return new `TodoList` objects,
instead of modifying the current one.
This means `TodoList` is **immutable**.

Also note that all these functions are easy to create, and it would also be easy to create unit
tests for them.

Adding these functions to the `TodoList` class will allow us to manage the immutable list of
todos in a clean and efficient way, without resorting to external "immutable state libraries"
like [Immer](https://www.npmjs.com/package/immer).

## State

Finally, we need to define the store state. In the future, we may want to add a lot of
different things to the state, but for now we'll keep it simple
and just add the `TodoList` to it:

```tsx title="State.ts"
export class State {
  readonly todoList: TodoList;  

  constructor({todoList}: { todoList: TodoList }) {
    this.todoList = todoList;
  }      
  
  withTodoList(todoList: TodoList): State {
    return new State({todoList: todoList || this.todoList});
  }
  
  static initialState: State = new State({todoList: TodoList.empty});
}
```

Note the state class above has a `withTodoList()` function that returns a copy of the state,
but replacing the current list of todos with a new one. This is an **immutable** operation,
as it creates a new state object.

We also defined a static variable called `initialState`. That's optional, but common.
It's just a default state that can be used when the store is created.
For example, **instead** of:

```tsx
const store = new Store<State>({
  initialState: new State({todoList: TodoList.empty}),  
});
```

We can now write:

```tsx
const store = new Store<State>({
  initialState: State.initialState,
});
```



