---
sidebar_position: 12
---

# Plain JavaScript objects

In the previous sections, we used [ES6 classes to create the state](./full-code#tutorial-code).

If you'd prefer to use **plain JavaScript (or TypeScript) objects**, keep reading.
I'll show you how to create the state using _value objects_ or _objects with functions_.

## State as value objects

We will define our todo-items as simple value objects containing a string and a boolean.
The state will consist of a list of these todo items and a filter.

```ts
// A single todo item.
export interface TodoItem {
  text: string;
  completed: boolean;
}

export enum Filter {
  showAll = "Showing ALL",
  showCompleted = "Showing COMPLETED",
  showActive = "Showing ACTIVE",
}

// The app state
export interface State {
  todoList: TodoItem[];
  filter: Filter;
}
```

We can then create the store like this:

```ts
const store = createStore<State>({
  initialState: {
    todoList: [],
    filter: Filter.showAll,
  }
});
```

Since the state is now so simple,
the **actions** need to be rewritten to transform the state.
In other words, we need to put "business code" inside the actions.
For example:

```ts
class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {    

    let ifExists = this.state.todoList.some(
      (todo) => todo.text.toLowerCase() === this.text.toLowerCase()
    );

    if (ifExists) {
      throw new UserException(`The item "${this.text}" already exists.`, {
        errorText: `Type something else other than "${this.text}"`,
      });
    }

    const capitalizedText = this.text.trim().charAt(0).toUpperCase() + this.text.trim().slice(1);
    let newItem = { text: capitalizedText, completed: false };
    let newTodoList = [newItem, ...this.state.todoList];

    return { 
      todoList: newTodoList, 
      filter: this.state.filter 
    };
  }
}
```

This is the complete code with value objects:

<iframe
src="https://codesandbox.io/embed/k543sv?view=editor&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '650px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

<br></br>

## State as objects with functions

If we want to avoid adding "business code" to the actions,
we can instead add **functions** to the objects.
We want objects to know how to modify themselves.

For example, this would be our `TodoList` code:

```ts
export interface TodoList {
  items: TodoItem[];
  addTodoFromText: (text: string) => TodoList;
  addTodo: (newItem: TodoItem) => TodoList;
  ifExists: (text: string) => boolean;
  removeTodo: (item: TodoItem) => TodoList;
  removeCompleted: () => TodoList;
  toggleTodo: (item: TodoItem) => TodoList;
  isEmpty: () => boolean;
  countCompleted: () => number;
  [Symbol.iterator]: () => IterableIterator<TodoItem>;
  toString: () => string;
}

const createTodoList = (items: TodoItem[] = []): TodoList => ({
  items,
  addTodoFromText(text: string) {
    const trimmedText = text.trim();
    const capitalizedText =
      trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1);
    return this.addTodo(createTodoItem(capitalizedText));
  },
  addTodo(newItem: TodoItem) {
    if (newItem.text === "" || this.ifExists(newItem.text)) return this;
    else return createTodoList([newItem, ...this.items]);
  },
  ifExists(text: string) {
    return this.items.some(
      (todo) => todo.text.toLowerCase() === text.toLowerCase()
    );
  },
  removeTodo(item: TodoItem) {
    return createTodoList(
      this.items.filter((itemInList) => itemInList !== item)
    );
  },
  removeCompleted() {
    return createTodoList(
      this.items.filter((itemInList) => !itemInList.completed)
    );
  },
  toggleTodo(item: TodoItem) {
    const newTodos = this.items.map((itemInList) =>
      itemInList === item ? item.toggleCompleted() : itemInList
    );
    return createTodoList(newTodos);
  },
  isEmpty() {
    return this.items.length === 0;
  },
  countCompleted() {
    return this.items.filter((item) => item.completed).length;
  },
  *[Symbol.iterator]() {
    for (let i = 0; i < this.items.length; i++) {
      yield this.items[i];
    }
  },
  toString() {
    return `TodoList{${this.items.join(",")}}`;
  },
});
```

The code above is similar to [the one](./full-code#tutorial-code) we created with ES6 classes.
Now the actions don't need to know how to transform the state.
Instead, they ask the state to modify itself:

```ts
class AddTodoAction extends Action {
  constructor(readonly text: string) {
    super();
  }

  reduce() {    

    if (this.state.todoList.ifExists(this.text)) {
      throw new UserException(`The item "${this.text}" already exists.`, {
        errorText: `Type something else other than "${this.text}"`,
      });
    }

    let newTodoList = this.state.todoList.addTodoFromText(this.text);
    return this.state.withTodoList(newTodoList);
  }
}
```

This is the complete code with objects with functions:

<iframe
src="https://codesandbox.io/embed/2cwkjc?view=editor&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '650px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## Comparison

Let's compare the 3 approaches:

* [State as ES6 classes](./full-code#tutorial-code) - The business code is inside the state classes.
  Actions don't need to contain any business code. Easy to serialize with the `ClassPersistor`
  provided by Async Redux. Immutability is trivial.

* [State as value objects](#state-as-value-objects) - The business code is inside the actions.
  Easy to serialize with `JSON.stringify` and `JSON.parse`.
  May benefit from [Immer](https://www.npmjs.com/package/immer) to help with immutability.

* [State as objects with functions](#state-as-objects-with-functions) - The business code is inside
  the state objects.
  The actions don't need to contain any business code. Immutability is trivial.
  More difficult to serialize, since the deserialization process must preserve the functions.

In table format:

| Approach                                                            | Business Code Location   | Serialization                               | Immutability                                                  |
|---------------------------------------------------------------------|--------------------------|---------------------------------------------|---------------------------------------------------------------|
| [State as ES6 classes](./full-code#tutorial-code)                   | Inside the state classes | Easy with `ClassPersistor` from Async Redux | Trivial                                                       |
| [State as value objects](#state-as-value-objects)                   | Inside the actions       | Easy with `JSON.stringify` and `JSON.parse` | May benefit from [Immer](https://www.npmjs.com/package/immer) |
| [State as objects with functions](#state-as-objects-with-functions) | Inside the state objects | More difficult, must preserve functions     | Trivial                                                       |

