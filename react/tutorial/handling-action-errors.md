---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Handling action errors

We've seen how the [TodoInput](the-basic-ui#todoinput) component dispatches
an `AddTodoAction` to add a new todo item in the todo list.
We've also seen that the action checks if the new todo
item [already exists](sync-actions#what-if-the-item-already-exists) in the list and throws an error
of type `UserException` if it does:

In the `AddTodoAction`:

```tsx 
// Check if the item already exists
if (currentTodoList.ifExists(this.text)) {
  throw new UserException(
    `The item "${this.text}" already exists.`, {
    errorText: `Type something else other than "${this.text}"`
  });
}
```

As you can see above, we can provide both a **message** and an **error text** in the error:

```tsx
UserException("message", errorText: "errorText")
```

We want to accomplish two things:

* Open a dialog (or a toast) to show the `message` to the user.
* Show the `errorText` below the input, until the user starts typing again.

## Showing error messages in a dialog

Async Redux automatically opens a dialog to show the `message` of all the user exception errors
thrown by actions. For this to work, however, you must set up the desired dialog,
toast, or other suitable UI element.

This is done by providing the `showUserException` parameter, when you create the store:

```tsx
const store = new Store<State>({
  initialState: State.initialState,
  showUserException: userExceptionDialog, // Here!
});
```

For example, the following is a possible `userExceptionDialog` function that opens a dialog with
the error `message` thrown by the action:

<Tabs>
<TabItem value="rw" label="React">

```tsx
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { createRoot } from "react-dom/client";

// Alternative 1: Using a browser dialog
const userExceptionDialog: ShowUserException =
  (exception, count, next) => {
    let message = exception.title ? `${exception.title} - ${exception.message}` : exception.message;
    window.alert(message);
    next();
  };
  
// Alternative 2: Using the MUI library (mui.com) 
export const userExceptionDialog: ShowUserException = (exception: UserException, _count: number, next: () => void) => {
  const container = document.getElementById('dialog-root');
  if (!container) return;
  const root = createRoot(container!);
  const closeDialog = () => {
    root.unmount();
    next();
  };
  root.render(
    <Dialog open={true} onClose={closeDialog}>
      <DialogContent>
        <p>{exception.title || 'Error'}</p>
        <p>{exception.message}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>OK</Button>
      </DialogActions>
    </Dialog>
  );
};
```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx 
import { Alert } from 'react-native';

export const userExceptionDialog: ShowUserException =
  (exception, count, next) => {
    Alert.alert(
      exception.title || exception.message,
      exception.title ? exception.message : '',
      [{text: 'OK', onPress: (_value?: string) => next()}]
    );
  };
```

</TabItem>
</Tabs>

## Showing error messages in components

The second thing we want to accomplish is to show the `errorText` below the input field
until the user starts typing again.

In the `TodoInput` code, let's add the following 3 hooks:

```tsx 
let isFailed = useIsFailed(AddTodoAction);
let errorText = useExceptionFor(AddTodoAction)?.errorText ?? '';
let clearExceptionFor = useClearExceptionFor();
```

The `isFailed` variable will be `true` when the `AddTodoAction` fails.

And when it fails, the `errorText` variable will contain the `errorText` message of the exception,
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
the action. In the code below, we'll be clearing the error as soon as the user starts typing
again in the input field.

The `TodoInput` component now looks like this:

<Tabs>
<TabItem value="rw" label="React">

```tsx 
function TodoInput() {

  const [inputText, setInputText] = useState<string>('');

  const store = useStore();
  let isFailed = useIsFailed(AddTodoAction);
  let errorText = useExceptionFor(AddTodoAction)?.errorText ?? '';
  let clearExceptionFor = useClearExceptionFor();

  async function processInput(text: string) {
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
          if (e.key === 'Enter') processInput(inputText);
        }}
      />
      
      <Button onClick={() => processInput(inputText)}>Add</Button>
    </div>
  );
};
```

</TabItem>
<TabItem value="rn" label="React Native">

```tsx 
function TodoInput() {

  const [inputText, setInputText] = useState<string>('');
  
  const store = useStore();
  let isFailed = useIsFailed(AddTodoAction);
  let errorText = useExceptionFor(AddTodoAction)?.errorText ?? '';
  let clearExceptionFor = useClearExceptionFor();

  async function processInput(text: string) {
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
        onSubmitEditing={() => processInput(inputText)}
      />

      <TouchableOpacity onPress={() => processInput(inputText)}>
        <Text>Add</Text>
      </TouchableOpacity>
      
      {isFailed && <Text>{errorText}</Text>}
    </View>
  );
};
```

</TabItem>
</Tabs>

To see it working, just add a todo item with the text `Buy milk`
and then try adding another todo with the same text again.
A dialog will pop up with the following error message:

> The item "Buy milk" already exists

<br></br>

At the same time, an error text will appear below the input field with the `errorText`
that was defined in the user exception thrown by the action reducer:

> Type something else other than "Buy milk"

<br></br>

This is the code used above to show the error text below the input field:

```tsx 
// React Web
helperText={isFailed ? errorText : ""}

// React Native
{isFailed && <Text>{errorText}</Text>}
```

<br></br>

As soon as you start typing in the input field, the error text will disappear.
This is the code used above to clear the error text when the user starts typing again:

```tsx 
// React Web
onChange={(e) => {          
  setInputText(e.target.value);
  clearExceptionFor(AddTodoAction);
}}

// React Native
onChangeText={(text) => {            
  setInputText(text);
  clearExceptionFor(AddTodoAction);
}}
```

## Try it yourself

Type "Buy milk" in the input and press `Enter`.
Do it **twice** and a browser dialog will open with the error message:
`The item "Buy milk" already exists`.

As soon as you close the dialog, you'll also see the error text in red, below the input field:
`Type something else other than "Buy milk"`.

Start typing again in the input field and the error text will disappear.

<iframe
src="https://codesandbox.io/embed/wh23g4?view=preview&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=55&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '360px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

## How to disable the dialog

To disable showing the dialog for **some** specific errors,
simply add `.noDialog` to them:

```tsx
throw new UserException(`The item "${this.text}" already exists.`, {
  errorText: `Type something else other than "${this.text}"`,
}).noDialog; // Here!
```

Try adding `.noDialog` to the code of the running example above 
and see that the dialog doesn't show up anymore,
but the error message below the input field still works.
