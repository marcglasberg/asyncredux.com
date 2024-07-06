---
sidebar_position: 4
---

# Comparing with MobX

Writing MobX applications seems very easy at first, but soon a lot of difficulties appear,
particularly when dealing with deeply nested structures
or needing advanced features like serialization.

To try and fix this, MobX-State-Tree was created, but doesn't play well with TypeScript,
and breaks IDE navigation. To try and fix MobX-State-Tree, MobX Keystone was created,
but it's also complex, and crashes with bad error messages that don't explain the
problem, or don't say where the problem is.

Async Redux also seems very easy at first, 
but continues being easy when the inevitable complexities of web and mobile development arise.
It plays well with TypeScript, and preserves IDE navigation.
