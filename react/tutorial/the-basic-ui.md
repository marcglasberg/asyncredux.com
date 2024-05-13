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
      <h1>Todos</h1>
      <TodoInput />
      <TodoList />        
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
      <Text>Todos</Text>
      <TodoInput />
      <TodoList />
      <RemoveAllButton />
    </View>
  );
};
```

</TabItem>
</Tabs>

I'll not be including the CSS in this tutorial, but you can find the full code in the GitHub
repository.

## TodoInput

The `TodoInput` component is a simple input field that allows the user to type a new todo item,
and then press Enter or click a button to add it to the list.

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

As you can see above, the `sendInputToStore` function is called when the user presses `Enter`
or clicks the "Add" button. This function uses the `useStore` hook to get the store and then
dispatches an `AddTodoAction` with the input text. 

A simplified version of the `sendInputToStore` could simply use the store's `dispatch`
method:

```tsx
async function sendInputToStore(text: string) {
  store.dispatch(new AddTodoAction(text));     
}
```

However, when the action succeeds, we want to clear the input field. To do this, we need to
wait until the action is completed, check if it completed successfully, and then clear the
input field with `setInputText('')`. 

This is why we use the `dispatchAndWait` method instead. It returns a Promise that
completes when the action is completed, and also return the `Status` object that allows us to
check if the action was successful:
               
```tsx
async function sendInputToStore(text: string) {
  let status = await store.dispatchAndWait(new AddTodoAction(text));
  if (status.isCompletedOk) setInputText(''); 
}
```
            
