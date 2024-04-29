---
sidebar_position: 7
---

# Test files

If you want your tests to be comprehensive you should probably have 3 different types of test for
each widget:

1. **State Tests** — Test the state of the app, including actions/reducers. This type of tests make
   use of the `StoreTester` described above.

2. **Connector Tests** — Test the connection between the store and the "dumb-widget". In other words
   it tests the "connector-widget" and the "view-model".

3. **Presentation Tests** — Test the UI. In other words it tests the "dumb-widget", making sure that
   the widget displays correctly depending on the parameters you use in its constructor. You pass in
   the data the widget requires in each test for rendering, and then writes assertions against the
   rendered output. Think of these tests as "pure function tests" of our UI. It also tests that the
   callbacks are called when necessary.

For example, suppose you have the counter app
shown <a href="https://github.com/marcglasberg/async_redux/blob/master/example/lib/main_increment_async.dart">
here</a>. Then:

* The **state test** could create a store with count `0` and description empty, and then
  dispatch `IncrementAction` and expect the count to become `1`. Then it could test
  dispatching `IncrementAndGetDescriptionAction` alters the count to `2`
  and the description to some non-empty string.

* The **connector test** would create a store and a page with the `MyHomePageConnector` widget. It
  would then access the `MyHomePage` and make sure it gets the expected info from the store, and
  also that the expected `IncrementAndGetDescriptionAction` is dispatched when the "+" button is
  tapped.

* The **presentation test** would create the `MyHomePage` widget, pass `counter:0`
  and `description:"abc"` parameters in its constructor, and make sure they appear in the screen as
  expected. It would also test that the callback is called when the "+" button is tapped.

Since each widget will have a bunch of related files, you should have some consistent naming
convention. For example, if some dumb-widget is called `MyWidget`, its file could
be `my_widget.dart`. Then the corresponding connector-widget could be `MyWidgetConnector`
in `my_widget_CONNECTOR.dart`. The three corresponding test files could be
named `my_widget_STATE_test.dart`, `my_widget_CONNECTOR_test.dart`
and `my_widget_PRESENTATION_test.dart`. If you don't like this convention use your own,
but just choose one early and stick to it.
