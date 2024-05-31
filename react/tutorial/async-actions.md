---
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Asynchronous actions

The `AddTodoAction` previously described is a **[synchronous](./sync-actions)** action.
It adds a new todo item to the list and returns the new state immediately.

Now let's see how we can create **asynchronous** actions,
that can involve network requests, file system operations,
or any other kind of asynchronous operations.

## Add Random Todo

Let's create an action called `AddRandomTodoAction` that will read some text from a server,
and use this text to add a new todo item to the list.

We'll be using an API called "Dummy Json", which is openly available at https://dummyjson.com.

Here is the action:

```tsx title="AddRandomTodoAction.ts"
class AddRandomTodoAction extends Action {

  async reduce() {
    let response = await fetch("https://dummyjson.com/todos/random/1");
    if (!response.ok) throw new UserException("Failed to load.");
    
    let jsonResponse = await response.json();
    let text = jsonResponse[0].todo;
     
    return (state) => state.withTodoList(this.state.todoList.addTodoFromText(text));
  }
} 
``` 

As you can see above, the `reduce` method is now `async`. This allows us to use the `await` keyword
to wait for the server response.

Another difference is that now we are **not** returning the new state directly.
Instead, we are returning a **function** that receives the current state and returns the new state:

```tsx
return (state) => state.withTodoList(this.state.todoList.addTodoFromText(text)); 
``` 

This is necessary when the action is asynchronous, because of the way Promises work in JavaScript.
When using TypeScript, you don't need to worry about forgetting this:
If you try to return the new state directly from an asynchronous action,
Async Redux will show a compile time error.

## Adding a spinner

We'll also add an `AddRandomTodoButton` with label "Add Random Todo" to our _Todo List_ app.
When clicked, this button dispatches the action we've created above.

We want to show a spinner (also called "circular progressor" or "activity indicator")
or a `Loading...` text, while the action is running. We also want to disable the button while
loading, so that the user can't click it multiple times.

We can use the `useIsWaiting` hook, that returns `true` when the action is running,
and `false` when it is not:

<Tabs>
<TabItem value="rw" label="React">

```tsx
function AddRandomTodoButton() {

  let isLoading = useIsWaiting(AddRandomTodoAction);
  const store = useStore();

  return (
    <button
        onClick={() => store.dispatch(new AddRandomTodoAction())}
        disabled={isLoading}
        >    
        { isLoading 
          ? 'Loading...' 
          : 'Add Random Todo'
        }
    </button>
  );
};
```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx 
function AddRandomTodoButton() {

  let isLoading = useIsWaiting(AddRandomTodoAction);
  const store = useStore();

  return (
    <TouchableOpacity 
      onPress={() => store.dispatch(new AddRandomTodoAction())}>
        { isLoading 
          ? <ActivityIndicator /> 
          : <Text>Add Random Todo</Text>
        }
    </TouchableOpacity>
  );
};
```

</TabItem>
</Tabs>

## Combining isWaiting and isFailed

You can combine the `useIsWaiting` and `useIsFailed` hooks
to show both a spinner if the information is loading,
and an error message if the loading fails:

<Tabs>
<TabItem value="rw" label="React">

```tsx
function AddRandomTodoButton() {

  let isLoading = useIsWaiting(AddRandomTodoAction);
  let isFailed = useIsFailed(AddRandomTodoAction);
  let errorText = useExceptionFor(AddRandomTodoAction)?.errorText ?? '';
  const store = useStore();

  return (
    <div>
      <button
          onClick={() => store.dispatch(new AddRandomTodoAction())}
          disabled={isLoading}
          { isLoading 
            ? 'Loading...' 
            : 'Add Random Todo'
          }
      </button>
      {isFailed && <div>{errorText}</div>}
    </div>
  );
};
```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx
function AddRandomTodoButton() {

  let isLoading = useIsWaiting(AddRandomTodoAction);
  let isFailed = useIsFailed(AddRandomTodoAction);
  let errorText = useExceptionFor(AddRandomTodoAction)?.errorText ?? '';
  const store = useStore();

  return (
    <View>
      <TouchableOpacity 
        onPress={() => store.dispatch(new AddRandomTodoAction())}>
          { isLoading 
            ? <ActivityIndicator /> 
            : <Text>Add Random Todo</Text>
          }
      </TouchableOpacity>
      {isFailed && <Text>{errorText}</Text>}
    </View>
  );
};
```

</TabItem>
</Tabs>

<br></br>

## Try it yourself

Click the "Add Random Todo" button below, to add random todo items to the list:

Then, check the code below to see how the `AddRandomTodoAction` and `AddRandomTodoButton` are
implemented.

<iframe
src="https://codesandbox.io/embed/mrkz2d?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=50&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '650px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>
