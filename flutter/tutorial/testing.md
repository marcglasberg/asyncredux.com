---
sidebar_position: 10
---

# Testing

How would we go about testing our _Todo List_ app?

It's straightforward: let's dispatch some actions, wait for them to finish,
and then verify if the new state is as expected, or check if some error was thrown.

We have the following actions in our app:

* `AddTodoAction`
* `RemoveAllTodosAction`
* `RemoveCompletedTodosAction`
* `AddRandomTodoAction`
* `ToggleTodoAction`
* `NextFilterAction`

## Basic action testing

Let's start with the `AddTodoAction`.
This action adds a new todo item with the given text to the list.
That is, unless the text already exists in the list, in which case it throws an error.

This is a possible test for this action:

```tsx
test('AddTodoAction', async () => {

  const store = createStore<State>({ initialState: State.initialState });
  
  // Should add a new todo item, with text 'Some text'
  await store.dispatchAndWait(new AddTodoAction('Some text'));  
  expect(store.state.todoList.items[0].text).toBe('Some text');
  
  // Fail to add the same text again
  let status = await store.dispatchAndWait(new AddTodoAction('Some text'));    
  expect(status.originalError).toBeInstanceOf(UserException);          
});
```

Easy, right? We create a new store, dispatch the action, and check the new state.
The `dispatchAndWait` method waits for the action to finish dispatching,
and returns the action `status`, which contains detailed information about the dispatch,
including any errors thrown.

## Setting the initial state for the test

Now, let's test the `RemoveAllTodosAction`. We expect this action to remove all todo items from the
list, which means we must first add some items to the list.

In other words, we must set the initial state of the store as a prerequisite for this test.

There are a few ways to do this. For example, we can first create the store,
and then dispatch actions to change its initial state into the desired one:

```tsx
const store = createStore<State>({ initialState: State.initialState });
store.dispatch(new AddTodoAction('First todo'));
store.dispatch(new AddTodoAction('Second todo'));
```

Alternatively, we could have already created the store with the proper
initial state, in a single step:

```tsx
const store = createStore<State>({
  initialState: 
    State.initialState.withTodoList(
      new TodoList(
        [
        new TodoItem('First todo', false),
        new TodoItem('Second todo', true),
        ]
      )
    )
});
```

Or, we could have created the state separately:

```tsx
let item1 = new TodoItem('First todo', false);
let item2 = new TodoItem('Second todo', true);
let todoList = new TodoList([item1, item2]);
let state = State.initialState.withTodoList(todoList);
 
const store = createStore<State>({ initialState: state });
```

The rest of the test is straightforward. This is the complete code:

```tsx
test('RemoveAllTodosAction', async () => {

  let item1 = new TodoItem('First todo', false);
  let item2 = new TodoItem('Second todo', true);
  let todoList = new TodoList([item1, item2]);
  let state = State.initialState.withTodoList(todoList);
     
  const store = createStore<State>({ initialState: state });
  
  // Should remove all todo items
  await store.dispatchAndWait(new RemoveAllTodosAction());  
  expect(store.state.todoList.items.length).toBe(0);          
});
```

## Testing asynchronous actions

Both `AddTodoAction` and `RemoveAllTodosAction` above are "synchronous",
meaning they don't involve any asynchronous operation. We know this by looking at their reducers,
which are declared with `reduce()`.

The only asynchronous action we have in our app is `AddRandomTodoAction`, which is declared
with `async reduce()` and returns a `Promise`. This action fetches a random todo item
from an external API:

```tsx
class AddRandomTodoAction extends Action {
  async reduce() {
    let response = await fetch("https://dummyjson.com/todos/random/1");
    if (!response.ok) throw new UserException("API failed.");
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;
    
    return (state: State) =>
      state.withTodoList(this.state.todoList.addTodoFromText(text));
  }
}
```

Testing an asynchronous action is just as easy, and **not** different from testing a synchronous
one. We still dispatch the action, wait for it to finish, and check the new state.

```tsx 
test('AddRandomTodoAction', async () => {

  const store = createStore<State>({ initialState: State.initialState });
  
  // Should add a new todo item
  await store.dispatchAndWait(new AddRandomTodoAction());  
  expect(store.state.todoList.items.length).toBe(1);              
});
```

The test above is calling the real external API.
This works, but note we can't check the text of the new
todo item, because it's random. We could instead mock or simulate the API call to have it return a
fixed value, and then check if the new todo item has the expected text.

To that end, let's first go back to the `AddRandomTodoAction` code,
and extract the API call into a separate function called `fetchRandomTodo`:

```tsx
class AddRandomTodoAction extends Action {  

  async reduce() {
    let text = await this.fetchRandomTodo();    
    return (state: State) => state.withTodoList(this.state.todoList.addTodoFromText(text));
  }
  
  async fetchRandomTodo() {   
    let response = await fetch("https://dummyjson.com/todos/random/1");
    if (!response.ok) throw new UserException("API failed.");
    let jsonResponse = await response.json();
    return jsonResponse[0].todo;
  }
}
```

We can now mock the `fetchRandomTodo` method in our test:

```tsx
class MockAddRandomTodoAction extends AddRandomTodoAction {
  async fetchRandomTodo() {
    return "Fixed text";
  }
}

test('AddRandomTodoAction', async () => {
  const store = createStore<State>({ initialState: State.initialState });
  
  // Here we use the mock action
  await store.dispatchAndWait(new MockAddRandomTodoAction());    
  
  // Now we can check if the new todo item has the expected text    
  expect(store.state.todoList.items[0].text).toBe("Fixed text");          
});
```

The above code is just an example, and it's not the recommended way to mock functions.
You should feel free to use any mocking features of your test framework,
or any mocking library you prefer.

And remember you can also use the real API calls, turning your tests into easy-to-write
integration tests.

## Try it yourself

Now, try to implement the tests for the remaining synchronous actions:

* `RemoveCompletedTodosAction`
* `AddRandomTodoAction`
* `ToggleTodoAction`
* `NextFilterAction`
