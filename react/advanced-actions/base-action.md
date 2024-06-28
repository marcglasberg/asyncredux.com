---
sidebar_position: 1
---

# Base action

In Async Redux, all actions must extend `ReduxAction<State>`.
For example:

```tsx
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

class Increment extends ReduxAction<State> {
  reduce() {
    return (state: State) => state.increment();
  }
}
```

In all the code I show in this documentation, you'll see I usually write `extend Action`
instead of `extend ReduxAction<State>`.

This is because I'm assuming you have previously defined your own abstract base action class
called simply `Action`, that itself extends `ReduxAction<State>`. Then, you may have all your
actions extend this `Action` class instead.

This is how you would define the `Action` class:

```tsx 
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

export abstract class Action extends ReduxAction<State> { }
```

Remember this is optional, but recommended. The reason to do this is twofold:

* First, you'll avoid writing `extends ReduxAction<State>` in every action class.
  Now, you'll need to write `extends Action` instead, which is simpler.

* And second, to have a common place to put any common logic
  that all your actions should have access to. More on that later.




