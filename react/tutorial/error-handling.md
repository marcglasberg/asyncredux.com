---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Error handling

We've seen [here](the-basic-ui#todoinput) how the `TodoInput` component dispatches
an `AddTodoAction` to add a new todo item in the todos list.
Then [here](sync-action#if-the-item-already-exists) we've seen that
the action checks if the new todo item already exists in the list and throws a `UserException`
if it does.

Now let's go back to the `TodoInput` and modify it to show an error message when the user tries to
add an existing todo item.

Let's start by adding the following 3 hooks to the `TodoInput` component:

```tsx 
let isFailed = useIsFailed(AddTodoAction);
let errorText = useExceptionFor(AddTodoAction)?.errorText ?? '';
let clearExceptionFor = useClearExceptionFor();
```

The `isFailed` variable will be `true` when the action fails.

In this case, the `errorText` variable will contain the `errorText` message of the exception,
which was defined in the `AddTodoAction` action:

```tsx 
throw new UserException(
  `The item "${this.text}" already exists.`, {
    errorText: `Type something else other than "${this.text}"`
  });
```

Finally, the `clearExceptionFor` function will clear the error for the `AddTodoAction` action.
Note the error is already cleared automatically when the action is dispatched again.
We only need to clear it manually if we want to clear the error message without dispatching
the action. In the code below we are doing this as soon as the user starts typing again 
in the input field.

The `TodoInput` component now looks like this:

<Tabs>
<TabItem value="rw" label="React Web">

```tsx title="AppContent.tsx"
const TodoInput: React.FC = () => {

  const [inputText, setInputText] = useState<string>('');

  const store = useStore();
  let isFailed = useIsFailed(AddTodoAction);
  let errorText = useExceptionFor(AddTodoAction)?.errorText ?? '';
  let clearExceptionFor = useClearExceptionFor();

  async function sendInputToStore(text: string) {
    let status = await store.dispatchAndWait(new AddTodoAction(text))
    if (status.isCompletedOk) setInputText('');
  }

  return (
    <div>
      <TextField className='inputField'
        error={isFailed}
        helperText={isFailed ? errorText : ""}
        value={inputText}
        onChange={(e) => {          
          setInputText(e.target.value);
          clearExceptionFor(AddTodoAction);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') sendInputToStore(inputText);
        }}
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
  let isFailed = useIsFailed(AddTodoAction);
  let errorText = useExceptionFor(AddTodoAction)?.errorText ?? '';
  let clearExceptionFor = useClearExceptionFor();

  async function sendInputToStore(text: string) {
    let status = await store.dispatchAndWait(new AddTodoAction(text));
    if (status.isCompletedOk) setInputText('');
  }

  return (
    <View>    
      <TextInput
        placeholder={'Type here...'}
        value={inputText}          
        onChangeText={(text) => {            
          setInputText(text);
          clearExceptionFor(AddTodoAction);
        }}
        onSubmitEditing={() => sendInputToStore(inputText)}
      />

      <TouchableOpacity onPress={() => sendInputToStore(inputText)}>
        <Text>Add</Text>
      </TouchableOpacity>
      
      {isFailed && <Text>{errorText}</Text>}
    </View>
  );
};
```

</TabItem>
</Tabs>

To test it, try adding a todo item with the text `Buy milk` and then try to add it again.

As soon as you add it again, a dialog will appear with the error message: 
> The item "Buy milk" already exists

Then, an error text will appear below the input field with the error text: 
> Type something else other than "Buy milk"

As soon as you start typing in the input field, the error text will disappear.
