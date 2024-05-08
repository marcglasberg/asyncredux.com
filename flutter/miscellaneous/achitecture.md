---
sidebar_position: 22
---

# Architectural discussion

Reading the following text is not important for the practical use of Async Redux, and is meant only
for those interested in architectural discussions:

### Is Async Redux really Redux?

According to redux.js.org there are three principles to Redux:

1. **The state of your whole application is stored in an object tree within a single store.**

   That’s true for Async Redux.

2. **The only way to change the state is to emit an action, an object describing what happened.**

   That’s also true for Async Redux.

3. **To specify how the state tree is transformed by actions, you write pure reducers.**

   Ok, so how about middleware? It's not possible to create real world applications without async
   calls and external databases access. So, even in vanilla Redux, actions start async processes
   that yield results that only then will be put into the store state, through reducers. So it's not
   true that the state tree depends only on pure functions. You can't separate the pure part and
   call it a reducer, and then conveniently forget about the impure/async part. In other words, you
   have A and B. A is simple and pure, but we can't call it a reducer and say that's part of our
   principles, and then forget about B. Async Redux acknowledges that B is also part of the
   solution, and then creates tools to deal with it as easily as possible. The litmus test here, to
   prove that Async Redux is Redux, is that you can have a 1 to 1 mapping from vanilla Redux
   reducers+middleware code to the Async Redux sync+async reducers code. The same async code will
   call the same pure code. You just organize it differently to avoid boilerplate. Another way to
   look at it is that at first glance the Async Redux reducer doesn't appear to be a pure function.
   Pure function reducers are the wall of sanity against the side effects managed by middleware via
   thunks, sagas, observables, etc. But when you take a second look, `return state.copy(...)` is the
   pure reducer, and everything else in `reduce()` is essentially middleware.

### Besides the reduction of boilerplate, what are the main advantages of the Async Redux architecture?

In vanilla Redux it's easy to reason about the code at first, when it's just pure function reducers,
but it gets difficult to understand the whole picture as soon as you have to add complex Middleware.
When you see a side by side comparison of code written for vanilla Redux and for Async Redux, the
code is easier to understand with Async Redux.

Also, vanilla Redux makes it easy to test its pure functions reducers, but it doesn't help at all
with testing the middleware. In contrast, since Async Redux natively takes async code into
consideration, its testing capabilities make it easy to test the code as a whole.

Async Redux also helps with code errors, by simply letting your reducers throw errors. Async Redux
will catch them and deal with them appropriately, while vanilla Redux forces your middleware to
catch errors and maybe even dispatch actions do deal with them.

### Is Async Redux a minimalist or lightweight Redux version?

No. Async Redux is concerned with being "easy to use", not with being lightweight. In terms of
library code size it's larger than the original Redux implementation. However, it's still very
small, and will make the total application code smaller than with the vanilla implementation,
because of the boilerplate reduction. In terms of speed/performance there should be no differences
in respect to the vanilla implementation.

### Is the Async Redux architecture useful for small projects?

It's usually said that you should not use Redux for small projects, because of the extra boilerplate
and limitations. Maybe it's not worth the effort. However, since Async Redux is easier than vanilla
Redux and has far less boilerplate, the limit of code complexity where a robust architecture starts
making sense is much lower.
