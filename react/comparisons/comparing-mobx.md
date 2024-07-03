---
sidebar_position: 4
---

# Comparing with MobX

Writing MobX applications seems very easy at first, but soon a lot of complexity
arises, particularly when dealing with deeply nested structures or needing more features
like serialization.

To try and fix this, MobX-State-Tree was created, but doesn't play well with TypeScript,
and breaks IDE navigation. To try and fix MobX-State-Tree, MobX Keystone was created,
but it's also complex, and crashes with bad error messages that don't explain the
problem, or don't say where the problem is.

Async Redux aims to be very easy at first, but also to continue being easy when
the inevitable complexity of web and mobile development arises.
It plays well with TypeScript, and preserves IDE navigation.
