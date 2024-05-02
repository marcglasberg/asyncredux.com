---
sidebar_position: 3
---

# Refresh indicators

How to show a RefreshIndicator while some action is running?

In a real Flutter app it's also the case that some Widgets ask for futures that complete when some
async process is done.

The `dispatchAndWait()` function returns a future which completes as soon as the action is done.

This is an example using the `RefreshIndicator` widget:

```dart
Future<void> downloadStuff() => dispatchAndWait(DownloadStuffAction());

return RefreshIndicator(
    onRefresh: downloadStuff;
    child: ListView(...),
```                 

Or, if you have multiple actions you can use `dispatchAndWaitAll`.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_dispatch_future.dart">
Dispatch Future Example</a>.
