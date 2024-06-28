---
sidebar_position: 8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# User exceptions

Actions that fail can simply [throw errors](./advanced-actions/errors-thrown-by-actions).

Those errors can be of any type, but in this page we'll discuss a special type of
error called **`UserException`**.
This is provided natively by Async Redux, and it represents errors that are **not bugs** in the
code, but rather something that the user can fix.

In other words, if something wrong happens in an action,
you can `throw new UserException('Some suitable error message')` to automatically
open a dialog and show a message to the user.

## Example

Pretend a user is transferring money in your app,
but the user typed `$0.00` as the amount to transfer.
This is an error, but you don't want to log this as an app bug.
Instead, you want to show a message to the user saying _"You cannot transfer zero dollars"_.

This is a perfect use case for `UserException`:

```ts
class TransferMoney extends Action {
  constructor(private amount: number) {}

  reduce() {
    if (this.amount === 0) 
      throw new UserException('You cannot transfer zero dollars.');
    
    return state.copy({
      cashBalance: state.cashBalance - this.amount
    });    
  }
}
```

As another example, suppose you want to save the user's name,
but you only accept names with at least 4 characters.
If the user types a name with less than 4 chars, you want to show an error message to the user.
You also want to show an error message if the server failed to save the user:

```ts
class SaveUser extends Action {
  constructor(private name: string) {}

  async reduce() {
    if (this.name.length < 4) 
      throw new UserException('Name must have at least 4 letters.');
    
    await this.saveUser(this.name);
    return (state) => state.copy(user: state.user.copy(name: this.name);
  }
  
  async saveUser(name: string) {
    const response = await axios.post('/api/user', { name });
    if (response.status !== 200) {
      throw new UserException('Something went wrong when saving the user');
    }
  }    
}
```

## Error queue

When an action causes a `UserException`, it automatically goes into a special error queue in the
store. From there, an "error widget" can show these errors to the user, one at a time.

Your Team Lead should set up the error widget once for everyone. Regular developers only need to
throw `UserException`s in their daily work.

You can decide how the error widget looks. It could be a dialog box with the error message, a toast
notification, a list of errors shown somewhere, or something else.

Creating your own widget for the error queue is a more advanced topic. For now, we'll focus on
using the built-in error dialog provided by Async Redux.

## Show error messages in a dialog

Async Redux automatically opens a dialog to show the `message` of all the `UserException` errors
thrown by actions. For this to work, however, you must set up the desired dialog,
toast, or other suitable UI element.

This is done by providing the `showUserException` parameter, when you create the store:

```tsx
const store = new Store<State>({
  initialState: new State(),
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

