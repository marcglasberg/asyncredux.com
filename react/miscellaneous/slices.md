---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Slices

If you are used to Redux Toolkit or Zustand,
you may be familiar with the concept of _slices_.

The idea behind it is that your store can become bigger and bigger,
and tougher to maintain as you add more features.
With slices, you can treat your store as separate smaller individual stores.

## How to

I will show you how to implement slices with Async Redux,
and then I'm going to tell you why I think they are **not necessary**.

Consider the state below, for a stock trading application:

<Tabs>
<TabItem value="structure" label="Data structure">

```tsx
state
├── user
│   ├── id: string
│   ├── name: string
│   ├── email: string
│   ├── isAuthenticated: boolean
│   ├── preferences
│   │   ├── theme: string
│   │   ├── notifications: boolean
│   │   └── language: string
│   ├── portfolio
│   │   ├── totalValue: number
│   │   ├── stocks
│   │   │   ├── [stockId]
│   │   │   │   ├── ticker: string
│   │   │   │   ├── name: string
│   │   │   │   ├── quantity: number
│   │   │   │   ├── averageCost: number
│   │   │   │   └── currentValue: number
│   │   │   ├── [stockId]
│   │   │   │   ├── ...
│   │   │   └── ...
│   │   └── cashBalance: number
│   └── watchlist
│       ├── [stockId]
│       │   ├── ticker: string
│       │   ├── name: string
│       │   └── targetPrice: number
│       ├── [stockId]
│       │   ├── ...
│       └── ...
├── stocks
│   ├── [stockId]
│   │   ├── ticker: string
│   │   ├── name: string
│   │   ├── currentPrice: number
│   │   ├── dailyChange: number
│   │   ├── dailyChangePercent: number
│   │   ├── volume: number
│   │   └── marketCap: number
│   ├── [stockId]
│   │   ├── ...
│   └── ...
├── transactions
│   ├── [transactionId]
│   │   ├── stockId: string
│   │   ├── type: string
│   │   ├── quantity: number
│   │   ├── price: number
│   │   ├── date: string
│   │   └── status: string
│   ├── [transactionId]
│   │   ├── ...
│   └── ...
├── news
│   ├── [newsId]
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── url: string
│   │   ├── source: string
│   │   └── date: string
│   ├── [newsId]
│   │   ├── ...
│   └── ...
├── alerts
│   ├── [alertId]
│   │   ├── stockId: string
│   │   ├── type: string
│   │   ├── targetPrice: number
│   │   ├── message: string
│   │   ├── isActive: boolean
│   │   └── date: string
│   ├── [alertId]
│   │   ├── ...
│   └── ...
└── settings
    ├── theme: string
    ├── notifications: boolean
    ├── language: string
    └── security
        ├── twoFactorAuth: boolean
        ├── backupEmail: string
        └── changePasswordDate: string
```

</TabItem>
<TabItem value="classes" label="Classes">

```ts
class Stock {
    constructor(
        public ticker: string,
        public name: string,
        public currentPrice: number,
        public dailyChange: number,
        public dailyChangePercent: number,
        public volume: number,
        public marketCap: number
    ) {}
}

class PortfolioStock {
    constructor(
        public ticker: string,
        public name: string,
        public quantity: number,
        public averageCost: number,
        public currentValue: number
    ) {}
}

class WatchlistStock {
    constructor(
        public ticker: string,
        public name: string,
        public targetPrice: number
    ) {}
}

class Portfolio {
    constructor(
        public totalValue: number,
        public stocks: { [stockId: string]: PortfolioStock },
        public cashBalance: number
    ) {}
}

class Preferences {
    constructor(
        public theme: string,
        public notifications: boolean,
        public language: string
    ) {}
}

class User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public isAuthenticated: boolean,
        public preferences: Preferences,
        public portfolio: Portfolio,
        public watchlist: { [stockId: string]: WatchlistStock }
    ) {}
}

class Transaction {
    constructor(
        public stockId: string,
        public type: string,
        public quantity: number,
        public price: number,
        public date: string,
        public status: string
    ) {}
}

class News {
    constructor(
        public title: string,
        public description: string,
        public url: string,
        public source: string,
        public date: string
    ) {}
}

class Alert {
    constructor(
        public stockId: string,
        public type: string,
        public targetPrice: number,
        public message: string,
        public isActive: boolean,
        public date: string
    ) {}
}

class Security {
    constructor(
        public twoFactorAuth: boolean,
        public backupEmail: string,
        public changePasswordDate: string
    ) {}
}

class Settings {
    constructor(
        public theme: string,
        public notifications: boolean,
        public language: string,
        public security: Security
    ) {}
}

class State {
    constructor(
        public user: User,
        public stocks: { [stockId: string]: Stock },
        public transactions: { [transactionId: string]: Transaction },
        public news: { [newsId: string]: News },
        public alerts: { [alertId: string]: Alert },
        public settings: Settings
    ) {}
}
```

</TabItem>
<TabItem value="plainobjs" label="Plain objects">
    
```ts
interface Stock {
    ticker: string;
    name: string;
    currentPrice: number;
    dailyChange: number;
    dailyChangePercent: number;
    volume: number;
    marketCap: number;
}

interface PortfolioStock {
    ticker: string;
    name: string;
    quantity: number;
    averageCost: number;
    currentValue: number;
}

interface WatchlistStock {
    ticker: string;
    name: string;
    targetPrice: number;
}

interface Portfolio {
    totalValue: number;
    stocks: { [stockId: string]: PortfolioStock };
    cashBalance: number;
}

interface Preferences {
    theme: string;
    notifications: boolean;
    language: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    isAuthenticated: boolean;
    preferences: Preferences;
    portfolio: Portfolio;
    watchlist: { [stockId: string]: WatchlistStock };
}

interface Transaction {
    stockId: string;
    type: string;
    quantity: number;
    price: number;
    date: string;
    status: string;
}

interface News {
    title: string;
    description: string;
    url: string;
    source: string;
    date: string;
}

interface Alert {
    stockId: string;
    type: string;
    targetPrice: number;
    message: string;
    isActive: boolean;
    date: string;
}

interface Security {
    twoFactorAuth: boolean;
    backupEmail: string;
    changePasswordDate: string;
}

interface Settings {
    theme: string;
    notifications: boolean;
    language: string;
    security: Security;
}

interface State {
    user: User;
    stocks: { [stockId: string]: Stock };
    transactions: { [transactionId: string]: Transaction };
    news: { [newsId: string]: News };
    alerts: { [alertId: string]: Alert };
    settings: Settings;
}   
```   

</TabItem>
</Tabs>

As [previously discussed](../advanced-actions/base-action-with-common-logic),
you may create a base action class called `Action` that extends `ReduxAction`.
By default, all actions that on their turn extend `Action` have access to the entire state,
and can change any part of it.

To implement slices, you can implement other extra base actions,
each with access to only a part of the state.

The first level of the state shown above
contains `user`, `stocks`, `transactions`, `news`, `alerts`, and `settings`. 
Each of these could be a slice, so let's create a base action 
that has easier access to the `user` state, and can only change that `user` state:

Here is the code for when your state is made of classes,
and also for when it's made of plain objects:

<Tabs>
<TabItem value="classes" label="Classes">

```tsx 
abstract class UserAction extends Action {

  // Getter shortcut to the user state.
  get user(): User { return this.state.user; }
  
  // User specific reducer.
  abstract reduceSlice(): User | null | Promise<((user: User) => (User | null)) | null>;

  // Override the reduce method to call reduceSlice.
  reduce() {
    let result = this.reduceSlice(this.state.user);
    if (result === null) return null;    
    else if (result instanceof Promise) {
      return result.then((promiseReducer) => {
        if (promiseReducer === null) return null;        
        return (state: State) => {
          let newData = promiseReducer(state.user);
          if (newData === null) return null;          
          return state.withUser(newData);
        };
      });
    }       
    else return state.withUser(newData);
  }
}
```

</TabItem>
<TabItem value="plainobj" label="Plain objects">

```tsx
abstract class UserAction extends Action {

  // Getter shortcut to the user state.
  get user(): User { return this.state.user; }
  
  // User specific reducer.
  abstract reduceSlice(): User | null | Promise<((user: User) => (User | null)) | null>;

  // Override the reduce method to call reduceSlice.
  reduce() {
    let result = this.reduceSlice(this.state.user);
    if (result === null) return null;    
    else if (result instanceof Promise) {
      return result.then((promiseReducer) => {
        if (promiseReducer === null) return null;        
        return (state: State) => {
          let newData = promiseReducer(state.user);
          if (newData === null) return null;          
          return { ...state, user: newData };
        };
      });
    }       
    else return { ...state, user: newData };
  }
}
```

</TabItem>
</Tabs>

The code above is a bit complex, but you don't need to understand it much.
Simply copy it and adapt it to your needs.
Also, you only need to write it once and then forget about it.

<br></br>

To use it, you should write `extends UserAction`:

```tsx
class DuplicatePortfolio extends UserAction { 
  
  reduceSlice() {
    // Type `this.user` instead of `this.state.user`
    let newPortfolio = this.user.portfolio.duplicate();    
    
    // Return a `User` object instead of a `State`.
    return this.user.withPortfolio(newPortfolio); 
  }   
}
```

You may have noted that slices in Async Redux are simply "views"
where your actions only see and change part of the state.
This means you can slice the same state as many times as you see fit,
in overlapping ways, and you are not restricted to slicing the first level of the state.

For example, let's see how to create a slice for the second level, `user.portfolio`:

<Tabs>
<TabItem value="classes" label="Classes">

```tsx 
abstract class PortfolioAction extends Action {

  // Getter shortcut to the portfolio state.
  get portfolio(): Portfolio { return this.state.user.portfolio; }
  
  // Portfolio specific reducer.
  abstract reduceSlice(): Portfolio | null | Promise<((portfolio: Portfolio) => (Portfolio | null)) | null>;

  // Override the reduce method to call reduceSlice.
  reduce() {
    let result = this.reduceSlice(this.state.user.portfolio);
    if (result === null) return null;    
    else if (result instanceof Promise) {
      return result.then((promiseReducer) => {
        if (promiseReducer === null) return null;        
        return (state: State) => {
          let newData = promiseReducer(state.user.portfolio));
          if (newData === null) return null;          
          return state.withUser(state.user.withPortfolio(newData));
        };
      });
    }       
    else return state.withUser(state.user.withPortfolio(newData));
  }
}
```

</TabItem>
<TabItem value="plainobj" label="Plain objects">

```tsx
abstract class PortfolioAction extends Action {

  // Getter shortcut to the portfolio state.
  get portfolio(): Portfolio { return this.state.user.portfolio; }
  
  // Portfolio specific reducer.
  abstract reduceSlice(): Portfolio | null | Promise<((portfolio: Portfolio) => (Portfolio | null)) | null>;

  // Override the reduce method to call reduceSlice.
  reduce() {
    let result = this.reduceSlice(this.state.user.portfolio);
    if (result === null) return null;    
    else if (result instanceof Promise) {
      return result.then((promiseReducer) => {
        if (promiseReducer === null) return null;        
        return (state: State) => {
          let newData = promiseReducer(state.user.portfolio));
          if (newData === null) return null;          
          return {...state, user: { ...state.user, portfolio: newData } };
        };
      });
    }       
    else return {...state, user: { ...state.user, portfolio: newData } };
  }
}
```

</TabItem>
</Tabs>

<br></br>

To use it, you should now write `extends PortfolioAction`:

```tsx
class DuplicatePortfolio extends PortfolioAction { 
  
  reduceSlice() {
    // Type `this.portfolio` instead of `this.state.user.portfolio`
    let newPortfolio = this.portfolio.duplicate();
    
    // Return a `Portfolio` object instead of a `State`.
    return newPortfolio; 
  }   
}
```

## Why slices may not be necessary

As explained, the idea behind slices is that your store
can become tougher to maintain as you add more features.

However, with Async Redux, your state naturally stays simple enough
that it won't get tougher to maintain.
That's specially true if your state is made
of [classes](../tutorial/creating-the-state)
or [objects with functions](../tutorial/plain-javascript-obj#state-as-objects-with-functions).

However, if your state is made
of simple [value objects](../tutorial/plain-javascript-obj#state-as-value-objects),
then it's possible things get more complex with time,
and at some point you'll want to implement slices.

## Easy state access without slices

Even if you create no slices, you can still
add shortcut getters and selectors to your base `Action`,
as [previously discussed](../advanced-actions/base-action-with-common-logic).

For example:

```tsx 
import { ReduxAction } from 'async-redux-react';
import { State } from 'State';

export abstract class Action extends ReduxAction<State> { 

  // Getter shortcut to the user state.
  get user(): User { return this.state.user; }
  
  // Getter shortcut to the portfolio state.
  get portfolio(): Portfolio { return this.state.user.portfolio; }
  
  // Selector to get a stock by ID from the user's portfolio.
  getStockById(stockId: string): Stock | undefined {
    return this.portfolio.stocks[stockId];
  }
}
```

This makes it easier to access the state properties in your actions,
which is half the reason you would want to create slices anyway.

In this case, however, you still need to return complete `State` objects.
For example:

<Tabs>
<TabItem value="classes" label="Classes">

```tsx
class DuplicatePortfolio extends Action { 
  
  reduceSlice() {
    // Type `this.portfolio` instead of `this.state.user.portfolio`
    let newPortfolio = this.portfolio.duplicate();    
    
    // Type `this.user` instead of `this.state.user`
    let newUser = this.user.withPortfolio(newPortfolio)
    
    // You need to return a `State` object.
    return this.state.withUser(newUser);
    ); 
  }   
}
```

</TabItem>
<TabItem value="plainobj" label="Plain objects">

```tsx
class DuplicatePortfolio extends Action { 
  
  reduceSlice() {
    // Type `this.portfolio` instead of `this.state.user.portfolio`
    let newPortfolio = duplicatePortfolio(this.portfolio);    
    
    // Type `this.user` instead of `this.state.user`
    let newUser = { ...this.user, portfolio: newPortfolio };
    
    // You need to return a state object.
    return { ...this.state, user: newUser };
  }
  
  duplicatePortfolio(portfolio: Portfolio): Portfolio {
    // Implement the logic to duplicate the portfolio
  }  
}
```

</TabItem>
</Tabs>

<br></br>
