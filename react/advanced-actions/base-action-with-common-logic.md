---
sidebar_position: 2
---

# Base action with common logic

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

* And second, to have a common place to put any **common logic**
  that all your actions should have access to. More on that later.

# Common logic

Suppose we have the following app state:

```ts
class State {
  constructor(
    public items: Item[] = [], 
    public selectedItem: Item | null = null
  ) {}
}

class Item {
  constructor(public id: string) {}  
}
```

And then we have an action, which selects an item by `id`:

```ts
class SelectItem extends Action {
  constructor(public id: number) { super(); }

  reduce() {
    let item = state.items.find(item => item.id === this.id);
    if (item === undefined) throw new UserException('Item not found');
    return state.copy({selectedItem: item});
  }
}
```

You would use it like this:

```ts
var item = new Item('A'); 
dispatch(new SelectItem(item));
```

Now, suppose we have a lot of actions that need to access the `items` and `selectedItem` properties.
We could add getters and selectors to the base `Action` class:

```ts
abstract class Action extends ReduxAction<State> {
  
  // Getters shortcuts
  get items(): Item[] { return this.state.items; }
  get selectedItem(): Item { return this.state.selectedItem; }

  // Selectors
  findById(id: number): Item | undefined { return this.items.find(item => item.id === id); }
  searchByText(text: string): Item | undefined { return this.items.find(item => item.text.includes(text)); }  
  get selectedIndex(): number { return this.selectedItemId !== null ? this.items.findIndex(item => item.id === this.selectedItemId) : -1; }
}
```

And then your actions have an easier time accessing the store state:

```ts
class SelectItem extends Action {
  constructor(public id: number) { super(); }

  reduce() {
    let item = this.findbyId(this.id); // Here!
    if (item === undefined) throw new UserException('Item not found');
    return state.copy({selectedItem: item});
  }
}
```

The difference above is that, instead of writing:

```ts
let item = state.items.find(item => item.id === this.id); 
```

You can simply write:

```ts
let item = this.findbyId(this.id); 
```

It may seem a small reduction of boilerplate, but it adds up.

In practice, your base action class may end up containing a lot of elaborate "selector functions",
which then can be used by all your actions.

The only requirement is that your actions now
extend `Action` instead of `ReduxAction<State>`.
