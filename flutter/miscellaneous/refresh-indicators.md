---
sidebar_position: 3
---

# Refresh indicators

A refresh indicator is a visual cue to indicate that data is being updated or reloaded. 
It typically appears as a circular icon that animates (often by spinning) when a user performs a
"swipe to refresh" by pulling down on a list. 

This indicator provides feedback to the user that the system is processing their request to update
content, ensuring a responsive and interactive user experience. The refresh indicator disappears
once the data has been fully updated, signaling to the user that the latest content is now
displayed.
      
# Implementation 

How to show a "refresh indicator" while some action that implements a refresh is running?

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

Or, if you have multiple actions that need to be called to refresh the screen, 
you can use `dispatchAndWaitAll`.

Try running
the: <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_dispatch_future.dart">
Dispatch Future Example</a>.
