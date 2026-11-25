---
sidebar_position: 12
---

# IDE Navigation

In vanilla Redux, actions and reducers live in separate objects,
so it is not always easy to know which reducers will run when an action is dispatched.
You also have to wire reducers to actions manually, which makes it harder to move from
the dispatching code to the reducer that handles it.

With AsyncRedux, if you want to see what an action does, 
you can simply navigate to the action in your IDE and the reducer is right there. 
There is no need for manual wiring because reducers are methods on the action objects themselves.
                                                                                 
To navigate from the code that dispatches an action to the action implementation:

* In IntelliJ, use `Ctrl + B` on Windows and Linux, or `Command + B` on macOS.
* In VS Code, use `F12` or `Ctrl + click` on Windows and Linux, or `F12` or `Command + click` on macOS.

To list your app actions, go to the `AppAction` declaration and use your IDE to list its subclasses.
