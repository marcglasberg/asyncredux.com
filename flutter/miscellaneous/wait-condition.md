---
sidebar_position: 6
---

# Waiting for a certain condition

The `waitCondition` method lets you create **futures** that
complete when the application state meets a specific condition.
It's available both on the `Store` and on the `ReduxAction` classes.

For example:

```dart
class SaveAppointment extends ReduxAction<AppState> {  
  final Appointment appointment;  
  SaveAppointment(this.appointment);    

  Future<AppState> reduce() {    
    dispatch(CreateCalendarIfNecessaryAction());    
    await waitCondition((state) => state.calendar != null);
    return state.copy(calendar: state.calendar.copyAdding(appointment));
  }
}
```         

The above action needs to add an appointment to a calendar, but it can only do that if the calendar
already exists. Maybe the calendar already exists, but if not, creating a calendar is a complex
async process, which may take some time to complete.

To handle this, the action dispatches another action to create the calendar if needed,
and then use `await waitCondition()` to wait until a calendar becomes present in the state.
Only then it will continue, and add the appointment to the calendar.

## Details

This is the signature of the `waitCondition` method:

```dart
Future<ReduxAction<St>?> waitCondition(
    bool Function(St) condition, {
    bool completeImmediately = true,
    int? timeoutMillis,
  });
```

See the API documentation for details on `completeImmediately` and `timeoutMillis`.

## In tests

Suppose you have a test that dispatches some actions,
and you want to check that it results in a specific state.
You can use `store.waitCondition()` to wait until the state matches what you expect.

If the state never matches, `waitCondition` will eventually time out,
throw an exception, and fail the test.

Note: `waitCondition` returns the action that caused the condition to complete.
This is helpful in tests when you need to verify that the right action was dispatched or check the
[action's status](../advanced-actions/action-status).

