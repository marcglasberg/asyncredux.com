---
sidebar_position: 8
---

# Testing navigation

You can test navigation by asserting navigation types, route names etc. This is useful for
verifying app flow in unit tests, instead of widget or driver tests.

For example:

```dart         
var navigateAction = actions.get(NavigateAction).action as NavigateAction;
expect(navigateAction.type, NavigateType.pushNamed);
expect((navigateAction.details as NavigatorDetails_PushNamed).routeName, "myRoute");
```
