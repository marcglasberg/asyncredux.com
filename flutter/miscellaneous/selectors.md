---
sidebar_position: 8
---

# Selectors

Whether you access your store state with `context.state` or using a `StoreConnector`, you will need
to select the part of the state your widget needs. Sometimes that's very easy to do, for 
example, `state.user.name`. But sometimes it's more complex, like:

```dart
state.todos.where((todo) => todo.user == user).toList()
```

If you have some complex selecting logic that you use in different places, you may optionally 
want to create a "selector", which are named functions to return the part of the state you need. 
For example: 

```dart
static List<Todo> selectTodosForUser(AppState state, User user)
   => state.todoState.todos.where((todo) => (todo.user == user)).toList();
```     

Selectors may be put:

* Into separate dart files as global functions. 
* Into state classes, as static methods. 
* Into your base action (like `AppAction`) class, as instance methods.

## Cache (Reselectors)

Suppose your widget uses a `ListView.builder` to display user names as list items. 
You could get this information like so:

```dart
state.users[index].name;
```       

But now suppose you want to display only the users with names that start with the letter `A`. You
could filter the user list to remove all other names, like this:

```dart
state.users.where((user) => user.name.startsWith("A")).toList()[index].name;
```                                                                                           

This works, but will filter the list repeatedly, once for each index. This is not a problem for
small lists, but will become slow if the list contains thousands of users.

The solution to this problem is caching the filtered list. 
To that end, you can use the cache functionality provided by Async Redux,
which is also called a "reselector".

First, create a **selector** that returns the information you need:

```dart
static List<User> selectUsersWithNamesStartingWith(AppState state, {String text})
   => state.users.where((user)=>user.name.startsWith(text)).toList();
```    

And then use it in your widget like this:

```dart
selectUsersWithNamesStartingWith(state, text: "A")[index].name;
```                                                                                           

Next, we have to modify the selector so that it caches the filtered list, turning into 
a **reselector**. 

Async Redux provides a few global functions which you can use, 
depending on the number of states, and the number of parameters your selector needs.

In this example, we have a single state and a single parameter, so we're going to use the `cache1_1`
method:

```dart                                                    
static List<User> selectUsersWithNamesStartingWith(AppState state, {String text})
   => _selectUsersWithNamesStartingWith(state)(text);

static final _selectUsersWithNamesStartingWith = cache1_1(
        (AppState state) 
           => (String text) 
              => state.users.where((user)=>user.name.startsWith(text)).toList());
```  

The above code will calculate the filtered list only once, and then return it when the selector is
called again with the same `state` and `text` parameters.

If the `state` changes, or the `text` changes (or both), it will recalculate and then cache again
the new result.

We can further improve this by noting that we only need to recalculate the result when `state.users`
changes. Since `state.users` is a subset of `state`, it will change less often. So a better selector
would be this:

```dart
static List<User> selectUsersWithNamesStartingWith(AppState state, {String text})
   => _selectUsersWithNamesStartingWith(state.users)(text);
 
static final _selectUsersWithNamesStartingWith = cache1_1(
        (List<User> users) 
           => (String text) 
              => users.where((user)=>user.name.startsWith(text)).toList());
```  

## Cache syntax

For the moment, Async Redux provides these six methods that combine 1 or 2 states with 0, 1 or 2
parameters:

```dart
cache1((state) => () => ...);
cache1_1((state) => (parameter) => ...);
cache1_2((state) => (parameter1, parameter2) => ...);

cache2((state1, state2) => () => ...);
cache2_1((state1, state2) => (parameter) => ...);
cache2_2((state1, state2) => (parameter1, parameter2) => ...);
```    

I have created only those above, because for my own usage I never required more than that. Please,
open an <a href="https://github.com/marcglasberg/async_redux/issues">issue</a>
to ask for more variations in case you feel the need.

This syntax treats the states and the parameters differently. If you call some selector while
keeping the **same state** and changing only the parameter, the selector will cache all the results,
one for each parameter.

However, as soon as you call the selector with a **changed state**, it will delete all of its
previous cached information, since it understands that they are no longer useful. And even if you
don't call that selector ever again, it will delete the cached information if it detects that the
state is no longer used in other parts of the program. In other words, Async Redux keeps the cached
information in <a href="https://pub.dev/packages/weak_map">weak-map</a>, so that the cache will not
hold to old information and have a negative impact in memory usage.

## External reselect package

The reselect functionality explained above is provided out-of-the-box with Async Redux. However,
Async Redux also works perfectly with the external <a href="https://pub.dev/packages/reselect">reselect</a> package.

Then, why did I care to reimplement a similar functionality? What are the differences?

First, the Async Redux caches can keep any number of cached results for each selector, one for each
time the selector is called with the same states and different parameters. Meanwhile, the reselect
package keeps a single cached result per selector.

And second, the Async Redux selector discards the cached information when the state changes or is
no longer used. Meanwhile, the reselect package will always keep the states and cached results in
memory.
