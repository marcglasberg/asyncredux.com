---
sidebar_position: 2
---

# Comparing with TanStack Query

TanStack Query is a data-fetching and caching library for React,
that was later rebranded as an asynchronous state management.

While Redux leaves out dealing with async processes, TanStack Query goes to the other extreme
and sees state management as just dealing with async data fetching and caching.
In my opinion, thinking of state management in terms of data fetching is the wrong abstraction.

Async Redux manages state through actions, which can be sync or async and change the state
in any way, not just fetch data.
Action can fail and they can succeed. You can wait for them to finish, retry them, debounce,
throttle them and do optimistic updates.
