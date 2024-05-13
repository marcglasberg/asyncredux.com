---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating the state
      
We'll now define the state we'll need for our app:

* `TodoItem` to represent a single todo item
* `Todos` to represent a list of todo items
* `State` to represent the store state, and contain the list of todos
  
These can be plain JavaScript objects, but also classes. 
I'll use classes in this tutorial.

## TodoItem

The `TodoItem` class represents a single todo item,
with some text and a completed status:

```tsx title="Todos.ts"
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

Note the `toggleCompleted()` function that returns a copy of the item 
with the same text, but with the opposite completed status.

This class is immutable, as it doesn't have any setters, and all functions return new objects.

## Todos

The `Todos` class is a simple list of todo items:

```tsx title="Todos.ts"
export class Todos {  
  constructor(public readonly items: TodoItem[] = []) {}  
}
```

We can add of sorts of functions to the `Todos` class, which will later help us manage the list of 
todos. These are a few examples:

* `addTodoFromText` - Add a new todo item from a text string.
* `addTodo` - Add a new todo item to the list.
* `ifExists` - Check if a todo item with a given text already exists.
* `removeTodo` - Remove a todo item from the list.
* `toggleTodo` - Toggle the completed status of a todo item.
* `isEmpty` - Check if there are no todos that appear when a filter is applied.
* `iterator` - Allow iterating over the list of todos.
* `toString` - Return a string representation of the list of todos.
* `empty` - A static empty list of todos.

Here is the full `Todos` class:

```tsx title="Todos.ts"
export class Todos {  
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
      return new Todos([newItem, ...this.items]);
  }
  
  ifExists(text: string): boolean {
    return this.items.some(todo => todo.text === text);
  }
  
  removeTodo(item: TodoItem): Todos {
    return new Todos(this.items.filter(todo => todo !== item));
  }
  
  toggleTodo(item: TodoItem): Todos {
    const newTodos = this.items.map(itemInList => (itemInList === item) ? item.toggleCompleted() : itemInList);
    return new Todos(newTodos);
  }   
  
  isEmpty() {
    return this.items.length === 0;
  }

  * [Symbol.iterator]() {
    for (let i = 0; i < this.items.length; i++) {
      yield this.items[i];
    }
  }

  toString() {
    return `Todos{${this.items.join(',')}}`;
  }
  
  static empty: Todos = new Todos();
}
```

Note again that all functions above are immutable, as they return new `Todos` objects,
instead of modifying the current one. They are all easy to create, and even easier to create 
unit tests for.

Adding these functions to the `Todos` class will allow us to manage the list of todos in a clean 
and efficient way, keeping the state immutable without having to resort to libraries like Immer.
        
## State

Finally, we now need to define the store state. In the future the state can contain a lot of
different things, but for now it will only contain the list of todos.

```tsx title="State.ts"
export class State {
  readonly todos: Todos;  

  constructor({todos}: { todos: Todos }) {
    this.todos = todos;
  }      
  
  withTodos(todos: Todos): State {
    return new State({todos: todos || this.todos});
  }
  
  static initialState: State = new State({todos: Todos.empty});
}
```

Note the state class above has a `withTodos()` function that returns a copy of the state,
but replacing the current list of todos with a new one. This is an immutable operation,
as it creates a new state object.

We also defined a static variable called `initialState`. That's optional, but common. 
It's just a default state that can be used when the store is created.

Instead of: 

```tsx
const store = new Store<State>({
  initialState: new State({todos: Todos.empty}),  
});
```

we can now use:

```tsx
const store = new Store<State>({
  initialState: State.initialState,
});
```



