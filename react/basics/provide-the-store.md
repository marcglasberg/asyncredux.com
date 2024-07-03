---
sidebar_position: 2
---

# Provide the store

To provide the store [you just created](./store-and-state) to all your app,
import the `StoreProvider` component from `async-redux-react` and wrap your app with it.

Then, pass the store as a prop to the `StoreProvider`.

```tsx
import { Store, StoreProvider } from 'async-redux-react';
import { State } from './path-to-your-state-file';

const store = createStore<State>({ initialState: ... });

function App() {
  return (
    <StoreProvider store={store}>
      <AppContent />
    </StoreProvider>
  );
};
```

:::note

Your code should have a **single** store provider, at the top of your component tree.

:::

<hr></hr>

Next, let's see how to access the store's state from any component.
