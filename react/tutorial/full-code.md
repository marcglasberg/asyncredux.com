---
sidebar_position: 11
---

# Full code

If you're interested in seeing the full code of _Todo List_ applications that are even
more complete than the one we've built in this tutorial, you can check out these examples
in [Async Redux's GitHub repository](https://github.com/marcglasberg/async-redux-react):

* [Todo List app for **React Web**](https://github.com/marcglasberg/async-redux-react/tree/main/examples/todo-app-example)
* [Todo List app for **React Native**](https://github.com/marcglasberg/async-redux-react/tree/main/examples/TodoAppReactNative)

## Tutorial code

As a reference, the following is the full code of the web app we built in this tutorial,
fully commented, in files `index.tsx`, `App.tsx`, `styles.css` and `State.ts`.

Note all components and actions are in `App.tsx`,
and all state types are in `State.ts`,
just to make it easier for you to read the code.
In a real app they would be split it into multiple files.

```tsx title="index.tsx"
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```tsx title="App.tsx"
import "./styles.css";
import React from "react";
import { useEffect, useState } from "react";
import { Store, StoreProvider, ReduxAction } from "async-redux-react";
import { ShowUserException, ClassPersistor } from "async-redux-react";
import { useSelect, useStore, useIsWaiting } from "async-redux-react";
import { useIsFailed, useExceptionFor } from "async-redux-react";
import { useClearExceptionFor, UserException } from "async-redux-react";
import { State, TodoList, TodoItem, Filter } from "./State";

// Allows the user to reload the page without losing the todo list.
let persistor = new ClassPersistor<State>(
  async () => window.localStorage.getItem("state"),
  async (serialized: string) => window.localStorage.setItem("state", serialized),
  async () => window.localStorage.clear(),
  [State, TodoList, TodoItem, Filter]
);

// Sets up a dialog to show user exceptions thrown by actions.
let userExceptionDialog: ShowUserException = (exception, count, next) => {
  
  let message = exception.title
    ? `${exception.title} - ${exception.message}`
    : exception.message;
    
  // Opens a browser dialog with the exception message.  
  window.alert(message);
  
  // Goes to the next error in the queu, if any.
  next();
};

// We declare the store with its initial state etc.
const store = createStore<State>({
  initialState: State.initialState,
  showUserException: userExceptionDialog,
  persistor: persistor,
});

// Base `Action` class, to simplify declaring actions.
abstract class Action extends ReduxAction<State> {}

// We wrap the component tree with a `StoreProvider`.
export default function App() {
  return (
    <StoreProvider store={store}>
      <AppContent />
    </StoreProvider>
  );
}

// The app is composed of: 
// - A title
// - An input to add items
// - the list of todo items
// - Buttons to remove all and remove completed items
// - A button to add a random item
// - A filter button to show all, active, or completed items
function AppContent() {
  return (
    <div className="app">
      <h1>Todo List</h1> 
      <TodoInput />
      <ListOfTodos />
      <RemoveAllButton />
      <RemoveCompletedButton />
      <AddRandomTodoButton />
      <FilterButton />
    </div>
  );
}

// Input with an `Add` button.
// When the button is clicked, will dispatch an `AddTodoAction`.
function TodoInput() {
  const [inputText, setInputText] = useState<string>("");
  
  // Hook to access the store.
  const store = useStore();
  
  // Hook to check if the action failed.
  const isFailed = useIsFailed(AddTodoAction);
  
  // Hook to get the error text, in case the action failed.
  const errorText = useExceptionFor(AddTodoAction)?.errorText ?? "";
  
  // Hook to clear the error message, when the user types something new.
  const clearExceptionFor = useClearExceptionFor();
                    
  async function processInput(text: string) {  
    // Add a todo item with the given text.
    const status = await store.dispatchAndWait(new AddTodoAction(text));
    
    // If the action was successful, clear the input text.
    if (status.isCompletedOk) setInputText("");
  }

  // An input for the user to type, an "Add" button, 
  // and an error message in case the action failed. 
  return (
    <div>
      <input
        className={`todoInput ${isFailed ? "inputError" : ""}`}
        maxLength={50}
        placeholder="Type here..."
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          clearExceptionFor(AddTodoAction);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") processInput(inputText);
        }}
      />

      <button onClick={() => processInput(inputText)}>Add</button>
      <div className="errorText">{isFailed && errorText}</div>
    </div>
  );
}

// Vertical list of the todo items in the list.
function ListOfTodos() {

  // Hook to get the list of all todo items from the state.
  const todoItems = useSelect((state: State) => state.todoList.items);

  return (
    <div className="listOfTodos">
      {todoItems.map((item, index) => (
        <TodoItemComponent key={index} item={item} />
      ))}
    </div>
  );
}

// A single todo item in the list.
// A checkbox allows the user to mark the item as completed.
function TodoItemComponent({ item }: { item: TodoItem }) {

  const store = useStore();
  
  // Hook to read the current filter from the state.
  const filter = useSelect((state: State) => state.filter);

  // The item is shown if it's completed or not, according to the filter.
  return item.ifShows(filter) ? (
    <label>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => store.dispatch(new ToggleTodoAction(item))}
      />
      <div>{item.text}</div>
    </label>
  ) : (
    <span />
  );
}

// Button removes all items, using `RemoveAllTodosAction`.
function RemoveAllButton() {
  
  // Hook to access the store.
  const store = useStore();
  
  // The button is disabled when there are no items.
  const isDisabled = useSelect((state: State) => state.todoList.isEmpty());

  return (
    <button
      onClick={() => store.dispatch(new RemoveAllTodosAction())}
      disabled={isDisabled}
    >
      Remove All
    </button>
  );
}

// Button removes all completed items, using `RemoveCompletedTodosAction`.
function RemoveCompletedButton() {

  // Hook to access the store.
  const store = useStore();
  
  // The button is disabled when there are no completed items.
  const isDisabled = useSelect(
    (state: State) => state.todoList.countCompleted() === 0
  );

  return (
    <button
      onClick={() => store.dispatch(new RemoveCompletedTodosAction())}
      disabled={isDisabled}
    >
      Remove Completed
    </button>
  );
}

// Button to change the filter, using `NextFilterAction`.
// Filter can be: showAll, showActive, or showCompleted.
function FilterButton() {

  // Hook to access the store.
  const store = useStore();
  
  // Hook to get the current filter from the state.
  const filter = useSelect((state: State) => state.filter);

  return (
    <button onClick={() => { store.dispatch(new NextFilterAction()); }}>
      {filter}
    </button>
  );
}

// Action to add a todo item with the given text.
// If the item already exists, throws an error.
class AddTodoAction extends Action {
  constructor(readonly text: string) { super(); }

  reduce() {
    // Gets the current todo list.
    let currentTodoList = this.state.todoList;

    // If the item being added already exists, throw an error.
    if (currentTodoList.ifExists(this.text)) {
      throw new UserException(`The item "${this.text}" already exists.`, {
        errorText: `Type something else other than "${this.text}"`,
      });
    }

    // Add the item to the list.
    let newTodoList = currentTodoList.addTodoFromText(this.text);
    
    // Return the new state with the updated list.
    return this.state.withTodoList(newTodoList);
  }
}

// Action to remove all todo items from the list.
export class RemoveAllTodosAction extends Action {
  reduce() {
    // Return the new state with an empty todo list.
    return this.state.withTodoList(TodoList.empty);
  }
}

export class RemoveCompletedTodosAction extends Action {
  reduce() {
    // Return the new state with the todo list, but without the 
    // completed items. The filter is also reset to show all items.
    return this.state      
      .withTodoList(this.state.todoList.removeCompleted())
      .withFilter(Filter.showAll);
  }
}

// Action to add a random todo item, read from an API.
class AddRandomTodoAction extends Action {
  async reduce() {
  
    // Calls an API to get a random todo item.
    let response = await fetch("https://dummyjson.com/todos/random/1");
    
    // If the API call failed, throw an error.
    if (!response.ok) throw new UserException("API failed.");

    // Get the text of the todo item from the response json.
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;

    // Return the new state with the updated todo list.
    return (state: State) =>
      state.withTodoList(this.state.todoList.addTodoFromText(text));
  }
}

// Button to add a random todo item, using `AddRandomTodoAction`.
function AddRandomTodoButton() {
  
  // Hook to access the store.
  const store = useStore();
  
  // Hook to check if the given action is currently loading.
  const isLoading = useIsWaiting(AddRandomTodoAction);

  return (
    <button
      onClick={() => store.dispatch(new AddRandomTodoAction())}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Add Random Todo"}
    </button>
  );
}

// Action to toggle the completed status of a todo item.
class ToggleTodoAction extends Action {
  constructor(readonly item: TodoItem) { super(); }

  reduce() {
    let newTodoList = this.state.todoList.toggleTodo(this.item);
    return this.state.withTodoList(newTodoList);
  }
}

// Action to change the filter to the next one.
export class NextFilterAction extends Action {
  reduce() {
    let newFilter = this.state.filter;

    switch (newFilter) {
    
      // If the current filter is showActive, the next is showCompleted.
      case Filter.showActive:
        newFilter = Filter.showCompleted;
        break;
        
      // If the current filter is showCompleted, the next is showAll.
      case Filter.showCompleted:
        newFilter = Filter.showAll;
        break;
        
      // If the current filter is showAll, the next is showActive.
      case Filter.showAll:
        newFilter = Filter.showActive;
        break;
        
      // Make sure we handled all cases.
      default:
        throw new Error("Unknown filter: " + newFilter);
    }

    return this.state.withFilter(newFilter);
  }
}
```

```css title="styles.css"
.app {
  font-family: sans-serif;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
}

h1 {
  margin-bottom: 0;
}

button {
  height: 35px;
  min-width: 60px;
  background-color: rgb(72, 149, 208);
  color: white;
  border: 0;
  cursor: pointer;
  padding: 10px 20px;
  margin: 18px 0px 8px 0px;
}

button:disabled {
  opacity: 0.5;
}

input {
  height: 30px;
  padding-left: 8px;
  text-transform: capitalize;
  margin-right: 4px;
  margin-bottom: 5px;
}

input[type="checkbox"] {
  vertical-align: middle;
  margin-right: 8px;
}

label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.listOfTodos {
  text-align: left;
  background-color: rgb(230, 230, 230);
  padding: 12px 20px 20px 20px;
  max-width: 200px;
  width: 100%;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.1);
}

.listOfTodos > div {
  margin-bottom: 4x; 
}

.removeAllButton {
  background-color: blue;
  color: white;
  height: 40px;
  margin-top: 20px; 
}

.inputError {
  border: 1px solid red;
  background-color: #ffe6e6;
}

.errorText {
  color: red;
  font-size: 12px;
  margin-bottom: 14px;
  height: 12px;
}
```

```tsx title="State.ts"
// A single todo item.
export class TodoItem {
  constructor(public text: string, public completed: boolean = false) {}

  toggleCompleted() {
    return new TodoItem(this.text, !this.completed);
  }

  ifShows(filter: Filter) {
    return (
      filter === Filter.showAll ||
      (filter === Filter.showCompleted && this.completed) ||
      (filter === Filter.showActive && !this.completed)
    );
  }
}

// The list of all todo items.
export class TodoList {
  constructor(public readonly items: TodoItem[] = []) {}

  addTodoFromText(text: string): TodoList {
    const trimmedText = text.trim();
    const capitalizedText =
      trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1);
    return this.addTodo(new TodoItem(capitalizedText));
  }

  addTodo(newItem: TodoItem): TodoList {
    if (newItem.text === "" || this.ifExists(newItem.text)) return this;
    else return new TodoList([newItem, ...this.items]);
  }

  ifExists(text: string): boolean {
    return this.items.some(
      (todo) => todo.text.toLowerCase() === text.toLowerCase()
    );
  }

  removeTodo(item: TodoItem): TodoList {
    return new TodoList(
      this.items.filter((itemInList) => itemInList !== item)
    );
  }

  removeCompleted(): TodoList {
    return new TodoList(
      this.items.filter((itemInList) => !itemInList.completed)
    );
  }

  toggleTodo(item: TodoItem): TodoList {
    const newTodos = this.items.map((itemInList) =>
      itemInList === item ? item.toggleCompleted() : itemInList
    );
    return new TodoList(newTodos);
  }

  isEmpty() {
    return this.items.length === 0;
  }

  countCompleted(): number {
    return this.items.filter((item) => item.completed).length;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.items.length; i++) {
      yield this.items[i];
    }
  }

  toString() {
    return `TodoList{${this.items.join(",")}}`;
  }

  static empty: TodoList = new TodoList();
}

export enum Filter {
  showAll = "Showing ALL",
  showCompleted = "Showing COMPLETED",
  showActive = "Showing ACTIVE",
}

// The app state
export class State {
  todoList: TodoList;
  readonly filter: Filter;

  constructor({
    todoList,
    filter,
  }: {
    todoList: TodoList;
    filter: Filter;
  }) {
    this.todoList = todoList;
    this.filter = filter;
  }

  withTodoList(todoList: TodoList): State {
    return new State({ todoList: todoList, filter: this.filter });
  }

  withFilter(filter: Filter): State {
    return new State({ todoList: this.todoList, filter: filter });
  }

  static initialState: State = new State({
    todoList: TodoList.empty,
    filter: Filter.showAll,
  });
}
```
