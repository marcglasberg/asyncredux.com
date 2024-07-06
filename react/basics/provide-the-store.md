---
sidebar_position: 2
---

# Provide the store

To provide the store [you just created](./store-and-state) to all your app,
import the `StoreProvider` component from `async-redux-react` and wrap your app with it.

Note your code should have a **single** store provider, at the top of your component tree.

Then, pass the **store** as a prop to the `StoreProvider`.

```tsx title="index.tsx"
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```tsx title="App.tsx"
import React from "react";
import { createStore, StoreProvider } from "async-redux-react";
import State from "./State";

const store = createStore<State>({ initialState: ... });

function App() {
  return (
    <StoreProvider store={store}>
      <AppContent />
    </StoreProvider>
  );
};
```

## Try it out

<iframe
src="https://codesandbox.io/embed/w8djq4?view=editor&module=%2Fsrc%2FApp.tsx&hidenavigation=1&fontsize=12.5&editorsize=70&previewwindow=browser&hidedevtools=1&hidenavigation=1"
style={{ width:'100%', height: '400px', borderRight:'1px solid black' }}
title="counter-async-redux-example"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>

<hr></hr>

Next, let's see how to access the store's state from any component.
