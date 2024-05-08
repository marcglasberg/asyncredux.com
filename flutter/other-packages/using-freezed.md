---
sidebar_position: 3
---

# Freezed

How to use Freezed, BuiltValue, or other similar code generator packages?

In case you use
<a href="https://pub.dev/packages/built_value">built_value</a>
or <a href="https://pub.dev/packages/freezed">freezed</a> packages, the `WaitAction` works
out-of-the-box with them. In both cases, you don't need to create the `copy` or `copyWith` methods
by hand. But you still need to add the `Wait` object to the store state as previously described.

If you want to further customize `WaitAction` to work with other packages, or to use the `Wait`
object in different ways, you can do so by injecting your custom reducer into `WaitAction.reducer`
during your app's initialization. Refer to
the `WaitAction` <a href="https://github.com/marcglasberg/async_redux/blob/master/lib/src/wait_action.dart">
documentation</a> for more information.
