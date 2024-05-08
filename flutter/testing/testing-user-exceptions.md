---
sidebar_position: 6
---

# Testing UserExceptions

Since `UserException`s don't represent bugs in the code, Async Redux put them into the
store's `errors` queue, and then swallows them. This is usually what you want during production,
where errors from this queue are shown in a dialog to the user. But it may or may not be what you
want during tests.

In tests there are two possibilities:

1. You are testing that some `UserException` is thrown. For example, you want to test that users are
   warned if they typed letters in some field that only accepts numbers. To that end, your test
   would dispatch the appropriate action, and then check if the `errors` queue now contains
   an `UserException` with some specific error message.

2. You are testing some code that should **not** throw any exceptions. If the test has thrown an
   exception it means the test has failed, and the exception should show up in the console, for
   debugging. However, this won't work if when test throws an `UserException` it simply go to
   the `errors` queue. If this happens, the test will continue running, and may even pass. The only
   way to make sure no errors were thrown would be asserting that the `errors` queue is still empty
   at the end of the test. This is even more problematic if the unexpected `UserException` is thrown
   inside a `before()` method. In this case it will prevent the reducer to run, and the test will
   probably fail with wrong state but no errors in the console.

The solution is to use the `shouldThrowUserExceptions` parameter in the `StoreTester` constructor.

Pass `shouldThrowUserExceptions` as `true`, and all errors will be thrown and not swallowed,
including `UserException`s. Use this in all tests that should throw no errors:

```dart
var storeTester = StoreTester<AppState>(
                     initialState: AppState.initialState(), 
                     shouldThrowUserExceptions: true);
```

Pass `shouldThrowUserExceptions` as false (the default)
when you are testing code that should indeed throw `UserExceptions`. These exceptions will then
silently go to the `errors` queue, where you can assert they exist and have the right error
messages:

```dart
storeTester.dispatch(MyAction());
TestInfo info = await storeTester.waitAllGetLast([MyAction]);
expect(info.errors.removeFirst().msg, "You can't do this.");
```
