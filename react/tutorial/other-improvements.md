---
sidebar_position: 7
---

# Other improvements

Let's implement some other improvements to our todo list application:

* Add a checkbox to mark a todo item as completed
* Add a filter to show only the completed items, only the uncompleted items, or all items
* Add a button to remove all completed items
* Disable the _Remove All_ button when there are no items to remove
* Disable the _Remove Completed_ button when there are no completed items

## Completing and filtering a todo item

The [TodoItem](creating-the-state#todoitem) class already has a boolean flag called `completed`
that indicates if the todo item is completed or not.

We will:

1. Create the `Filter` enum:

    ```tsx
    export enum Filter {
      showAll = 'Showing ALL',
      showCompleted = 'Showing COMPLETED',
      showActive = 'Showing ACTIVE',
    }
    ```

2. Add the filter state to the `State` class:

   ```tsx
   export class State {
     todoList: TodoList;
     readonly filter: Filter;
   
   constructor({todoList, filter}: { todoList: TodoList, filter: Filter }) {
       this.todoList = todoList;
       this.filter = filter;
     }  
   
     withTodoList(todoList: TodoList): State {
       return new State({ todoList: todoList, filter: this.filter });
     }
     
     withFilter(filter: Filter): State {    
       return new State({todoList: this.todoList, filter: filter});
     }
   
     static initialState: State = new State({ 
       todoList: TodoList.empty, 
       filter: Filter.showAll 
     });
   }
   ```

3. Add a checkbox to the `TodoItemComponent` that allows the user to mark the todo item as
   completed. The checkbox dispatches the `ToggleTodoAction` action.

4. Modify the `TodoItemComponent` so that it only shows the item if it matches the filter.

5. Add the `RemoveCompletedButton` component that dispatches the `RemoveCompletedTodosAction`. The
   button is disabled when there are no completed items.

6. Modify the `RemoveAllButton` component so that it is disabled when there are no items to remove.

7. Add the `FilterButton` component that dispatches the `NextFilterAction` action. This button text is
   based on the current filter: "Showing all", "Showing completed", or "Showing active".

## Try it yourself

Click the "Add Random Todo" a few times, to add some items to the list. Then, mark some of
them as completed, and click the "Showing all" button to see how the filter works.

Read the code below and try to understand how it works.

<iframe
src="https://codesandbox.io/embed/qs35kc?view=split&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=50&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '650px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

