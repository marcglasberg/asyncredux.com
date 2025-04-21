---
sidebar_position: 3
---

# Serverpod Backend

[Serverpod](https://www.serverpod.dev/) is a backend framework for Dart and Flutter.

If your app uses Async Redux and your server uses Serverpod, you can add the Dart-only core
package [async_redux_core](https://pub.dev/packages/async_redux_core) to your server side.
  
Now, if you throw a `UserException` in your backend code, that exception will automatically be thrown in the frontend.
As long as the Serverpod cloud function is called inside an action,
and you have set up the `UserExceptionDialog` ([See here](../basics/failed-actions#showing-error-messages-in-a-dialog)),
Async Redux will display the exception message to the user in a dialog (or other UI element that you can customize).

Note: This can also be used with [package i18n_extension_core](https://pub.dartlang.org/packages/i18n_extension_core)
to make sure the error message gets translated to the user's language.
For example: `UserException('The password you typed is invalid'.i18n);` in the backend,
will reach the frontend already translated as
`UserException('La contraseña que ingresaste no es válida')` if the user
device is in Spanish.

## Setup

For all this to work in Serverpod, after you import `async_redux_core` in the `pubspec.yaml` file of the server project,
you must add the `UserException` class to your `generator.yaml` file, in its `extraClasses` section:

```yaml  
type: server
...

extraClasses:
    - package:async_redux_core/async_redux_core.dart:UserException
```  
