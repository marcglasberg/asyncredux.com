---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# The basic UI

The app UI contains:

* A **title**
* An **input** to add more todo items
* A **list** of todos
* A **button** to remove all todo items

<Tabs>
<TabItem value="rw" label="React Web">

```tsx title="AppContent.tsx"
export const AppContent: React.FC = () => {
  return (
    <div>
      <h1>Todo List</h1>
      <TodoInput />
      <ListOfTodos />        
      <RemoveAllButton />
    </div>
  );
};
```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx title="AppContent.tsx"
export const AppContent: React.FC = () => {
  return (
    <View>
      <Text>Todo List</Text>
      <TodoInput />
      <ListOfTodos />
      <RemoveAllButton />
    </View>
  );
};
```

</TabItem>
</Tabs>

<iframe
src="https://codesandbox.io/embed/cgq5rs?view=preview&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=55&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '360px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

<br></br>
<br></br>

Let's detail below the components: `TodoInput`, `ListOfTodos` and `RemoveAllButton`.

## TodoInput

The `TodoInput` component is a simple input field that allows the user to type a new todo item,
and then press `Enter` or click a button to add it to the list.

<Tabs>
<TabItem value="rw" label="React Web">

```tsx title="AppContent.tsx"
const TodoInput: React.FC = () => {

  const [inputText, setInputText] = useState<string>('');
  
  const store = useStore(); 
  async function sendInputToStore(text: string) {
    const status = await store.dispatchAndWait(new AddTodoAction(text))
    if (status.isCompletedOk) setInputText(''); 
  }
  
  return (
    <div>      
      <TextField value={inputText}
        onChange={(e) => { setInputText(e.target.value); }}
        onKeyDown={(e) => { if (e.key === 'Enter') sendInputToStore(inputText); }}
      />
      
      <Button onClick={() => sendInputToStore(inputText)}>Add</Button>
    </div>
  );
};
```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx title="AppContent.tsx"
const TodoInput: React.FC = () => {

  const [inputText, setInputText] = useState<string>('');
    
  const store = useStore();
  async function sendInputToStore(text: string) {
    let status = await store.dispatchAndWait(new AddTodoAction(text));
    if (status.isCompletedOk) setInputText(''); 
  }

  return (
    <View>          
      <TextInput
        placeholder={'Type here...'}
        value={inputText}          
        onChangeText={(text) => { setInputText(text); }}
        onSubmitEditing={() => sendInputToStore(inputText)}
      />

      <TouchableOpacity onPress={() => sendInputToStore(inputText)}>
        <Text>Add</Text>
      </TouchableOpacity>
    </View>          
  );
};
```

</TabItem>
</Tabs>

As you can see above, the `sendInputToStore` function is called whenever the user presses `Enter`
or clicks the "Add" button. This function uses the `useStore` hook to get a reference to the store,
and then dispatches an `AddTodoAction` with the input text.

A simplified version of the `sendInputToStore` could simply use the store's `dispatch`
method:

```tsx
async function sendInputToStore(text: string) {
  store.dispatch(new AddTodoAction(text));     
}
```

However, when the action succeeds, we want to clear the input field. To do this, we need
to **wait** until the action is completed, check if it completed **successfully**, and then clear
the input field with `setInputText('')`.

This is why instead of `dispatch` we want to use the `dispatchAndWait` method.
It returns a `Promise` that completes when the action is completed.
If we await it we get a status of type `ActionStatus`
that tells us if the action was successful or not.

In other words, we get the `status`,
and if `status.isCompletedOk` is true we can clear the input field:

```tsx
async function sendInputToStore(text: string) {
  let status = await store.dispatchAndWait(new AddTodoAction(text));
  if (status.isCompletedOk) setInputText(''); 
}
```

# Try it yourself

Type "Buy food" in the input, and press the `Add` button or the `Enter` key.
Try adding other todo items.
Then remove all of them by clicking the `Remove All` button.

To see all files in this project, 
click the "hamburger icon" in the top left corner of the code editor. 
The state classes are in file `State.ts`, 
while the store, actions and components are in the `App.tsx` file.

<iframe
src="https://codesandbox.io/embed/cgq5rs?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=55&previewwindow=browser"
style={{ width:'100%', height: '650px', border:'5px solid #58B87A', borderRadius: '4px' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>
