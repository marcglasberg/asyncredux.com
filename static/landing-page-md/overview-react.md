# Store, state, actions and reducers

The store holds all the application **state**, and you can only change the state by
dispatching **actions**. Each action has its own **reducer**, which changes the state.

```tsx
// The store holds the app state
const store = new Store<number>({initialState: 1});

// Actions have a reducer to change the state
class Increment extends Action {
  reduce() { 
    return state + 1; 
  };
}

// Dispatch actions to change the state
store.dispatch(new Increment());
```

&nbsp;

# Use the Store

Add a `StoreProvider` to the top of your component tree.

```tsx
const App = () => {
  return (
    <StoreProvider store={store}>
      <AppContent />
    </StoreProvider>
  );
};
```

&nbsp;

You can then use it in any component:

```tsx
const MyComponent = () => { 
  const store = useStore();
  const state = useAllState();

  return (
    <div>            
      <p>{state}</p>                     
            
      <Button onClick={() => store.dispatch(new LoadText())}> 
        Click me! 
      </Button>
                      
    </div>
  );
};
```

&nbsp;

# Actions can do asynchronous work

They download information from the internet, or do any other async work.

```tsx
const store = new Store<string>({initialState: ''});
```

```tsx
class LoadText extends Action {

  // This reducer returns a Promise
  async reduce() {

    // Download some information from the internet
    let response = await fetch('http://numbersapi.com/random/42');
    let text = await response.text(); 

    // Change the state with the downloaded information
    return (state) => text;
  }
```

&nbsp;

# Actions can throw errors

If some error happens, you can simply throw an `UserException`.
A dialog (or other UI) will open automatically, showing the error message to the user.

```tsx
class LoadText extends Action {
  
  async reduce() {    
    let response = await fetch('http://numbersapi.com/random/42');
    if (!response.ok) throw new UserException('Failed to load');
    
    let text = await response.text();     
    return (state) => text;
  }
```

&nbsp;

To show a spinner while the action is loading, use `isWaiting(action)`.

To show an error message as a component, use `isFailed(action)`.

```tsx
const MyComponent = () => {

  const isWaiting = useIsWaiting(LoadText); 
  const isFailed = useIsFailed(LoadText);  
  const state = useAllState();  
  
  if (isWaiting) return <CircularProgress />
  if (isFailed) return <p>Loading failed...</p>;
  return <p>{state}</p>;
}
```

&nbsp;

# Actions can dispatch other actions

You can use `dispatchAndWait` to dispatch an action and wait for it to finish.

```tsx
class LoadTextAndIncrement extends Action {

  async reduce() {
  
    // Dispatch and wait for the action to finish   
    await this.dispatchAndWait(new LoadText());
    
    // Only then, increment the state
    return (state) => state.copy({ count: state.count + 1 });  
  }
}
```

&nbsp;

You can also dispatch actions in **parallel** and wait for them to finish:

```tsx
class BuyAndSell extends Action {

  async reduce() {  
    
    // Dispatch and wait for both actions to finish
    await this.dispatchAndWaitAll([
      new BuyAction('IBM'), 
      new SellAction('TSLA')
    ]);        

    return (state) => state.copy({ 
      message: `New cash balance is ${this.state.cash}` 
    });
  }
}
```

&nbsp;

You can also use `waitCondition` to wait until the `state` changes in a certain way:

```tsx
class SellStockForPrice extends Action {
  constructor(public stock: string, public price: number) { super(); }

  async reduce() {
  
    // Wait until the stock price is higher than the limit price
    await this.waitCondition(
      (state) => state.stocks[this.stock].price >= this.price
    );
    
    // Only then, sell the stock
    this.dispatch(new SellStock(this.stock));
    
    // No further state change
    return null;
  }
}
```

&nbsp;

# Add features to your actions

To prevent an action from being dispatched while it's already running,
add the `nonReentrant` property to your action class and set it to `true`.

```tsx
class LoadText extends Action { 
  nonReentrant = true;
   
  reduce() { ... }
}
```

&nbsp;

To retry an action a few times with exponential backoff, if it fails,
add the `retry` property to your action class.

```tsx
class LoadText extends Action {   
  retry = {on: true}
         
  reduce() { ... }
}
```

&nbsp;

And you can specify the retry policy:

```tsx
class LoadText extends Action {

  retry = {
    initialDelay: 350, // Millisecond delay before the first attempt
    maxRetries: 3,     // Number of retries before giving up
    multiplier: 2,     // Delay increase factor for each retry
    maxDelay: 5000,    // Max millisecond delay between retries
  }
   
  reduce() { ... }
}
```

&nbsp;

To debounce an action, add the `debounce` property to your action class.

```tsx
class SearchText extends Action {
  constructor(public searchTerm: string) { super(); }
  
  debounce = 350 // Milliseconds
   
  async reduce()  {      
    let result = await loadJson('https://example.com/?q=', searchTerm);
    return (state) => state.copy({searchResult: result}); 
}
```

&nbsp;

# Persist the state

You can add a `persistor` to save the state to the local device disk.
It supports serializing JavaScript objects **and** ES6 classes out of the box.

```tsx
const store = new Store<string>({  
  persistor: new Persistor(),
});  
```

&nbsp;

# Testing your app is easy

Just dispatch actions and wait for them to finish.
Then, verify the new state or check if some error was thrown.

```tsx
class State {
  constructor(
    public items: string[], 
    public selectedItem: number
  ) {}
}

test('Selecting an item', async () => {

  const store = new Store<State>({      
    initialState: new State({ 
      items: ['A', 'B', 'C'], 
      selectedItem: -1 // No item selected 
    });    
  });
  
  // Should select item 2
  await store.dispatchAndWait(new SelectItem(2));
  expect(store.state.selectedItem).toBe('B');
  
  // Fail to select item 42
  let status = await store.dispatchAndWait(new SelectItem(42));    
  expect(status.originalError).toBeInstanceOf(UserException);          
});
```

&nbsp;

# Advanced setup

If you are the Team Lead, you set up the app's infrastructure in a central place,
and allow your developers to concentrate solely on the business logic.

You can add a `stateObserver` to collect app metrics, an `errorObserver` to log errors,
an `actionObserver` to print information to the console during development,
and a `globalWrapError` to catch all errors.

```tsx
const store = new Store<string>({    
  stateObserver: (action, prevState, newState, error, count) => { ... },
  errorObserver: (error, action, store) => { ... }
  actionObserver: (action, count, ini) => { ... }
  globalWrapError: (error) => { ... }
});  
```

&nbsp;

For example, here we handle `FirestoreError` errors thrown by Firebase.
We convert them into `UserException` errors, which are built-in types that
automatically show a message to the user in an error dialog:

```tsx
globalWrapError: (error: any) => {
        return (error instanceof FirestoreError)
          ? new UserException('Error connecting to Firebase')
          : error;
      }  
```

&nbsp;

# Advanced action configuration

The Team Lead may create a base action class that all actions will extend, and add some common
functionality to it. For example, getter shortcuts to important parts of the state,
and selectors to help find information.

```tsx
class State {  
  items: Item[];    
  selectedItem: number;
}

export abstract class Action extends ReduxAction<State> {

  // Getter shortcuts   
  get items() { return this.state.items; }
  get selectedItem() { return this.state.selectedItem; }
  
  // Selectors 
  findById(id) { return this.items.find((item) => item.id === id); }
  searchByText(text) { return this.items.find((item) => item.text.includes(text)); }
  get selectedIndex() { return this.items.indexOf(this.selectedItem); }
}
```

&nbsp;

Now, all actions can use them to access the state in their reducers:

```tsx
class SelectItem extends Action {
  constructor(public id: number) { super(); }

  reduce() {
    let item = this.findById(this.id);
    if (item === undefined) throw new Error('Item not found');
    return this.state.copy({selectedItem: item});
  }
}
```
