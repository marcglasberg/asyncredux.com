---
sidebar_position: 20
---

# Business logic

Where should you put your business logic in your application architecture?

## State classes

State classes form the core of your business logic. For example, in a _Todo List_
application you can have a `TodoList` class that manages the list of todos,
and a `Todo` class that manages a single todo. These are all state classes.

**Recommendation:** Implement the majority of your business logic within state classes.

## Actions and reducers

Actions and Reducers are also classified as business code.
But you should use them primarily only to invoke business logic from your state classes.

## React components

React Components are strictly client-side code.
Avoid implementing business logic in components.

## Custom react hooks

You should avoid creating and using custom hooks, when using Async Redux,
as they are mostly not necessary. However, if you do use custom hooks,
avoid incorporating business logic in them. 
