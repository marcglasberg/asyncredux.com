---
sidebar_position: 7
---

# State Declaration

While your main state class, usually called `AppState`, may be simple and contain all the state
directly, in a real world application you will probably want to create many state classes and add
them to the main state class. For example, if you have some state for the login, some user related
state, and some *todos* in a To-Do app, you can organize it like this:

```dart
@immutable
class AppState {

  final LoginState loginState;
  final UserState userState;
  final TodoState todoState;

 AppState({
	this.loginState,
	this.userState,
	this.todoState,
  });

  AppState copy({
	LoginState loginState,
	UserState userState,
	TodoState todoState,
  }) {
	return AppState(
	  login: loginState ?? this.loginState,
	  user: userState ?? this.userState,
	  todo: todoState ?? this.todoState,
	);
  }

  static AppState initialState() =>
	AppState(
	  loginState: LoginState.initialState(),
	  userState: UserState.initialState(),
	  todoState: TodoState.initialState());

  @override
  bool operator ==(Object other) =>
	identical(this, other) || other is AppState && runtimeType == other.runtimeType &&
	  loginState == other.loginState && userState == other.userState && todoState == other.todoState;

  @override
  int get hashCode => loginState.hashCode ^ userState.hashCode ^ todoState.hashCode;
}
```

All of your state classes may follow this pattern. For example, the `TodoState` could be like this:

```dart  
import 'package:flutter/foundation.dart'; 
import 'package:collection/collection.dart';

class TodoState {    
  
  final List<Todo> todos;            

  TodoState({this.todos});

  TodoState copy({List<Todo> todos}) {
    return TodoState(          
      todos: todos ?? this.todos);
  }             
  
  static TodoState initialState() => TodoState(todos: const []);               
  
  @override
  bool operator ==(Object other) {          
    return identical(this, other) || other is TodoState && runtimeType == other.runtimeType && 
      listEquals(todos, other.todos);
  }    
  
  @override
  int get hashCode => const ListEquality.hash(todos);
}
```
