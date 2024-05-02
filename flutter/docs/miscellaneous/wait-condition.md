---
sidebar_position: 6
---

# Waiting a certain condition

The `waitCondition` method from the `Store` class lets you create **futures** that complete when the
store state meets a certain condition:

```dart
/// Returns a future which will complete when the given condition is true.
/// The condition can access the state. You may also provide a
/// timeoutInSeconds, which by default is null (never times out).
Future<void> waitCondition(
   bool Function(St) condition, {
   int timeoutInSeconds
   })
```

For example:

```dart
class SaveAppointmentAction extends ReduxAction<AppState> {  
  final Appointment appointment;
  
  SaveAppointmentAction(this.appointment);      

  @override
  Future<AppState> reduce() {    
    dispatch(CreateCalendarIfNecessaryAction());    
    await store.waitCondition((state) => state.calendar != null);
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
