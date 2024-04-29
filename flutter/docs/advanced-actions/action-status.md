---
sidebar_position: 9
---

# Action status

You can use `action.status.isCompletedOk` to check if a dispatched action finished with no
errors (in more detail, if the action's methods `before` and `reduce` finished without throwing
any errors):

```dart
var action = MyAction(); 
await store.dispatchAndWait(action);
print(action.isCompletedOk);
```

Better yet, you can get this information directly through the `dispatchAndWait` method:

```dart       
var status = await store.dispatchAndWait(MyAction());
print(status.isCompletedOk);
```

One use case is when you want to save some info, and you want to leave the current screen if and
only if the save process succeeded:

```dart
class SaveAction extends ReduxAction<AppState> {      
  Future<AppState> reduce() async {
    bool isSaved = await saveMyInfo(); 
    if (!isSaved) throw UserException("Save failed.");	 
    ...
  }
}

var status = await dispatch(SaveAction(info));
if (status.isCompletedOk) Navigator.pop(context); // Or: dispatch(NavigateAction.pop()) 
```

This is all the information you can get from the action status:

```dart
var status = await dispatch(MyAction(info));
print(status.isCompleted);
print(status.isCompletedOk);
print(status.isCompletedFailed);
print(status.originalError);
print(status.wrappedError);
print(status.status.hasFinishedMethodBefore);
print(status.status.hasFinishedMethodReduce);
print(status.status.hasFinishedMethodAfter);
```
