---
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Async action

The `AddTodoAction` is a synchronous action. It adds a new todo item to the list and returns the
new state immediately.

Let's see how we can create an asynchronous action that loads some information from a server.

We'll create a new button called `<AddRandomTodoButton />` that will dispatch a new action
called `AddRandomTodoAction` that will then read some text from a server,
by using an open API called "NumbersAPI", and available at `https://numbersapi.com/`.

This is the action:

```tsx title="AddRandomTodoAction.ts"
export class AddRandomTodoAction extends Action {

  async reduce() {
    let response = await fetch('http://numbersapi.com/random/trivia');
    if (!response.ok) throw new UserException('Failed to connect to the NumbersAPI.');    
    let text = await response.text();
     
    return (state) => state.withTodos(this.state.todos.addTodoFromText(text));
  }
} 
``` 

As you can see above, the `reduce` method is now `async`. This allows us to use the `await` keyword
to wait for the server response.

Another difference is that we are not returning the new state directly. Instead, we are returning a
function that receives the current state and returns the new state.
This is necessary when the action is asynchronous because of the way Promise works in JavaScript.

You don't need to worry about forgetting this, because if you try to return the new state directly
from an asynchronous action, Async Redux will show a compile time error.
       
## Adding a spinner

When the user clicks the `<AddRandomTodoButton />`, we want to show a spinner while the action is
being executed.

To that, we'll use the `useIsWaiting` hook, 
that returns `true` when the action is running:

<Tabs>
<TabItem value="rw" label="React Web">

```tsx
const AddRandomTodoButton: React.FC = () => {

  let isLoading = useIsWaiting(AddRandomTodoAction);
  const store = useStore();

  return (
    <Button onClick={() => store.dispatch(new AddRandomTodoAction())}>
      {
      isLoading 
        ? <CircularProgress /> 
        : 'Add Random Todo'
      }
    </Button>
  );
};

```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx 
const AddRandomTodoButton: React.FC = () => {

  let isLoading = useIsWaiting(AddRandomTodoAction);
  const store = useStore();

  return (
    <TouchableOpacity onPress={() => store.dispatch(new AddRandomTodoAction())}>
      {
      isLoading 
        ? <ActivityIndicator /> 
        : <Text>Add Random Todo</Text>
      }
    </TouchableOpacity>
  );
};

```

</TabItem>
</Tabs>

