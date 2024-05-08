---
sidebar_position: 5
---

# Mocking actions and reducers

To mock an action and its reducer, create a `MockStore` instead of a regular `Store`.

The `MockStore` has a `mocks` parameter which is a map where the keys are action types, and the
values are the mocks. For example:

```dart
var store = MockStore<AppState>(
  initialState: initialState,  
  mocks: {
     MyAction1 : ...
     MyAction2 : ...
     ...
  },
);
```       

There are 5 different ways to define mocks:

1. Use `null` to disable dispatching the action of a certain type:

    ```dart
    mocks: {
       MyAction : null
    }
    ```       

2. Use a `MockAction<St>` instance to dispatch this mock action instead, and provide the **original
   action** as a getter to the mock action.

    ```dart                        
    class MyAction extends ReduxAction<AppState> {
      String url;
      MyAction(this.url);
      Future<AppState> reduce() => get(url);
    }      

    class MyMockAction extends MockAction<AppState> {  
      Future<AppState> reduce() async {                  
        String url = (action as MyAction).url;
        if (url == 'https://example.com') return 123;
        else if (url == 'https://flutter.io') return 345;
        else return 678;
      }
    }
    ```

    ```dart    
    mocks: {
       MyAction : MyMockAction()
    }
    ```       

3. Use a `ReduxAction<St>` instance to dispatch this mock action instead.

    ```dart                        
    class MyAction extends ReduxAction<AppState> {
      String url;            
      MyAction(this.url);
      Future<AppState> reduce() => get(url);
    }
    
    class MyMockAction extends ReduxAction<AppState> {  
      Future<AppState> reduce() async => 123;
    }
    ```

    ```dart    
    mocks: {
       MyAction : MyMockAction()
    }
    ```       

4. Use a `ReduxAction<St> Function(ReduxAction<St>)` to create a mock from the original action.

    ```dart                        
    class MyAction extends ReduxAction<AppState> {
      String url;        
      MyAction(this.url);
      Future<AppState> reduce() => get(url);
    }
    
    class MyMockAction extends MockAction<AppState> {
      String url;
      MyMockAction(this.url);  
      Future<AppState> reduce() async {                     
        if (url == 'https://example.com') return 123;
        else if (url == 'https://flutter.io') return 345;
        else return 678;
      }
    }
    ```

    ```dart   
    mocks: {
       MyAction : (MyAction action) => MyMockAction(action.url)
    }
    ```       

5. Use a `St Function(ReduxAction<St>, St)`
   or `Future<St> Function(ReduxAction<St>, St)`
   to modify the state directly.

    ```dart                        
    class MyAction extends ReduxAction<AppState> {
      String url;        
      MyAction(this.url);
      Future<AppState> reduce() => get(url);
    }
    ```

    ```dart   
    mocks: {
       MyAction : (MyAction action, AppState state) async {
          if (action.url == 'https://example.com') return 123;
          else if (action.url == 'https://flutter.io') return 345;
          else return 678;
       }
    }
    ```       

You can also change the mocks after a store is created, by using the following methods of
the `MockStore` and `StoreTester` classes:

```dart
MockStore<St> addMock(Type actionType, dynamic mock);
MockStore<St> addMocks(Map<Type, dynamic> mocks);
MockStore<St> clearMocks();
```
