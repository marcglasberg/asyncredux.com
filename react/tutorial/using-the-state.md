---
sidebar_position: 7
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using the state
                                                    
# ADD TO THIS TUTORIAL:
- Implement the RemoveAllButton and it's corresponding action
- Show how to use the state in a component: TodoList
- Talk about the filter
- Refer to the GitHub repo
- Show the user exception dialog setup
- Show the persistor setup
- Use some online service to display the app running  
- Implement `createStore` function to replace `new Store()`
- At the end of the tutorial, comment how easy it all was.  


```tsx title="App.tsx"
import React from "react";
import { Store, StoreProvider } from 'async-redux-react';

const store = new Store<State>({
  initialState: State.initialState,
  showUserException: userExceptionDialog,
  persistor: persistor,
});

export const App: React.FC = () => {
  return (
    <StoreProvider store={store}>
      <AppContent />
    </StoreProvider>
  );
}
```
