---
sidebar_position: 23
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

3. **To specify how the state is transformed by actions, you write pure reducers.**
    
   In Async Redux, the `return state.copy(...)` at the end of the `reduce()` method is the pure part,
   that specifies how the state is transformed, and is equivalent to vanilla Redux reducers.
   The rest of the code in the `reduce` method is the async part, equivalent to vanilla Redux middleware.

### Is Async Redux a minimalist/lightweight Redux version?

Async Redux aims to be easy to use, not the smallest possible. 
Its code is larger than vanilla Redux, but still very small overall. 
More importantly, it reduces boilerplate, so the total app code ends up smaller.

### Is the Async Redux architecture useful for small projects?

People often say Redux is not worth it for small projects because of its boilerplate and limits. 
But since Async Redux is simpler and cuts most of that boilerplate, 
it can be used for projects of any size.
