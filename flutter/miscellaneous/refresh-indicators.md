---
sidebar_position: 3
---

# Refresh indicators

A refresh indicator is a visual cue to indicate that data is being reloaded. 
It typically appears as an animated spinner when the user performs a "swipe to refresh" gesture,
pulling down on a list. 

This indicator disappears once the data is updated, 
signaling that the latest content is now displayed.
      
# Implementation 

In Flutter apps, a [`RefreshIndicator` widget](https://api.flutter.dev/flutter/material/RefreshIndicator-class.html) 
asks for a future that complete when the async refresh process is done.
This future can be provided by the `dispatchAndWait()` method.

An example:

```dart
// When the user pulls down the list
Future<void> downloadStuff() => dispatchAndWait(DownloadStuffAction());

// In the widget
return RefreshIndicator(
    onRefresh: downloadStuff;
    child: ListView(...),
```                 

If you have multiple actions that need to be called to refresh the screen, 
you can use `dispatchAndWaitAll`.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_dispatch_future.dart">
Dispatch Future Example</a>.
