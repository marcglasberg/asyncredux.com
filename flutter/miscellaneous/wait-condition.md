---
sidebar_position: 6
---

# Waiting for a certain condition

The `waitCondition` method lets you create **futures** that
complete when the store state meets a certain condition.

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

To that end, the action dispatches an action to create the calendar if necessary, and then use
the `store.waitCondition()` method to wait until a calendar is present in the state. Only then it
will add the appointment to the calendar.

## Details

This is the signature of the `waitCondition` method:

```dart
Future<ReduxAction<St>?> waitCondition(
    bool Function(St) condition, {
    bool completeImmediately = true,
    int? timeoutMillis,
  });
```

Check the API documentation for details on `completeImmediately` and `timeoutMillis`.

## In tests

Suppose you have a test that dispatches some actions, and you want to test that it results
in some specific state. You can use `waitCondition` to wait for the state to be as expected.

If the state is not as expected, the `waitCondition` method will time out, throwing an exception,
and failing the test.

Also note, the method returns the action responsible for the state change that completed
the condition. This can be useful in case your test needs to verify that the correct action was 
dispatched, or check the `action.status`.
