---
sidebar_position: 9
---

# Action Subclassing

Suppose you have the following `AddTodoAction` for the To-Do app:

```dart
class AddTodoAction extends ReduxAction<AppState> {
  final Todo todo;
  AddTodoAction(this.todo);

  @override
  AppState reduce() {
	if (todo == null) return null;
	else return state.copy(todoState: List.of(state.todoState.todos)..add(todo));
  }
}

// You would use it like this:
store.dispatch(AddTodoAction(Todo("Buy some beer.")));
```

Since all actions extend `ReduxAction`, you may further use object oriented principles to reduce
boilerplate. Start by creating an **abstract** action base class to allow easier access to the
sub-states of your store. For example:

```dart
abstract class BaseAction extends ReduxAction<AppState> {
  LoginState get loginState => state.loginState;
  UserState get userState => state.userState;
  TodoState get todoState => state.todoState;
  List<Todo> get todos => todoState.todos;
}
```

And then your actions have an easier time accessing the store state:

```dart
class AddTodoAction extends BaseAction {
  final Todo todo;
  AddTodoAction(this.todo);

  @override
  AppState reduce() {
	if (todo == null) return null;
	else return state.copy(todoState: List.of(todos)..add(todo)));
  }
}
```

As you can see above, instead of writing `List.of(state.todoState.todos)` you can simply
write `List.of(todos)`. It may seem a small reduction of boilerplate, but it adds up.

<br></br>

### Abstract Before and After

Other useful abstract classes you may create provide already overridden `before()` and `after()`
methods. For example, this abstract class turns on a modal barrier when the action starts, and
removes it when the action finishes:

```dart
abstract class BarrierAction extends ReduxAction<AppState> {
  void before() => dispatch(BarrierAction(true));
  void after() => dispatch(BarrierAction(false));
}
```

Then you could use it like this:

```dart
class ChangeTextAction extends BarrierAction {

  @override
  Future<AppState> reduce() async {
	String newText = await read(Uri.http("numbersapi.com","${state.counter}");
	return state.copy(
	  counter: state.counter + 1,
	  changeTextEvt: Event<String>(newText));
  }
}
```

The above `BarrierAction` is demonstrated
in <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_event_redux.dart">
this example</a>.
