---
sidebar_position: 1
---

# State

The application **state** is all the data that your app needs to function,
and that can change over time.

Usually you'd have a class that represents your app state.
Since `State` is a name already taken in Flutter, you can call it `AppState`.

This is an example:

```dart
class AppState {
  final String name;
  final int age;

  AppState({required this.name, required this.age});
}
```

It's optional but common to also define a static method `initialState` that returns an instance
of the state with initial values:

```dart
class AppState {
  final String name;
  final int age;

  AppState({required this.name, required this.age});  

  static AppState initialState() => AppState(name: "", age: 0);
}
```

## The immutability requirement

In Redux, the state class must be **immutable**.
This means that you can't change it directly.

> **Note:** If you're not familiar with immutability, it means that once an object is created,
> you can't change its fields. Usually the fields are marked as `final`.

Instead, you need to create a new `AppState` object every time you need to change the app state.
This is simple to do. For example, methods `withName` and `withAge` below
return a new `AppState` object with the new name or age:

```dart
class AppState {
  final String name;
  final int age;

  AppState({required this.name, required this.age});  

  static AppState initialState() => AppState(name: "", age: 0);
  
  // To change the name
  AppState withName(String name) => AppState(name: name, age: age);
  
  // To change the age
  AppState withAge(int age) => AppState(name: name, age: age);              
}
```

A common pattern is having a `copy` or `copyWith` method that allows you to change multiple fields
at once:

```dart
class AppState {
  ...
  
  // To change the name
  AppState withName(String name) => copy(name: name);
  
  // To change the age
  AppState withAge(int age) => copy(age: age);
  
  // To change any of the fields
  AppState copy({String? name, int? age}) =>
    AppState(
      name: name ?? this.name, 
      age: age ?? this.age
    );              
}
```

Your state can be composed of any immutable objects,
including other immutable objects that you create.
For example, the following is a state that represents a _Todo List_.
The `Todo` class is immutable:

```dart
class AppState {
  final IList<Todo> todos;

  AppState({required this.todos});

  static AppState initialState() => AppState(todos: []);
}

class Todo {
  final String description;
  final bool done;

  Todo({required this.description, this.done = false});
}
```

Note that the `todos` field is an immutable list of type `IList`, provided by the
<a href="https://pub.dev/packages/fast_immutable_collections">fast_immutable_collections</a>
package, which was also created by me.

You don't need to use package `fast_immutable_collections`, but it's recommended because it
provides immutable lists, sets and maps that are easier to use than trying to use standard Dart collections
like `List` in an immutable way.

To add and remove items from the list, you can use the `IList.add` and `IList.remove` methods:

```dart
class AppState {
  final IList<Todo> todos;

  AppState({required this.todos});

  static AppState initialState() => AppState(todos: IList<Todo>());
  
  AppState copy({IList<Todo>? todos}) =>
    AppState(todos: todos ?? this.todos);

  AppState add(Todo todo) => copy(todos: todos.add(todo));

  AppState remove(Todo todo) => copy(todos: todos.remove(todo);
}
```

## Single state

If you think having a single state class to represent all your app state is too restrictive,
it's actually not. You can have multiple state classes, as long as you put them all inside a single
class in the end. For example, suppose we need to represent a state that has a Todo List
plus some user information:

```dart
// Todo List
class TodoList {
  final IList<Todo> list;

  TodoList({this.list = const IList<Todo>()});

  TodoList copy({IList<Todo>? list}) =>
    TodoList(list: list ?? this.list);

  TodoList add(Todo todo) => copy(list: list.add(todo));

  TodoList remove(Todo todo) => copy(list: list.remove(todo));
}
 
 // User information
class User {
  final String name;
  final int age;

  User({this.name = "", this.age = 0});

  User copy({String? name, int? age}) =>
    User(name: name ?? this.name, age: age ?? this.age);
}
```

You can then create a single `AppState` class that holds both the `TodoList` and the `User`:

```dart
class AppState {
  final TodoList todoList;
  final User user;

  AppState({required this.todoList, required this.user});

  static AppState initialState() => 
    AppState(todoList: TodoList(), user: User());

  AppState copy({TodoList? todoList, User? user}) =>
    AppState(todoList: todoList ?? this.todoList, user: user ?? this.user);
    
  AppState withTodoList(LodoList todoList) => copy(todoList: todoList);
  
  AppState withUser(User user) => copy(user: user);
}
```

<hr></hr>

Now that we know how to create the state, let's see next how to create the Async Redux **store**
that will hold it.
