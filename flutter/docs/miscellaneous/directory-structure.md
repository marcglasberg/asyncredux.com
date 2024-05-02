---
sidebar_position: 19
---

# Directory Structure

What is the recommended directory structure?

You probably have your own way of organizing your directory structure, but if you want some
recommendation, here it goes.

First, separate your directory structure by **client** and **business**. The **client** directory
holds Flutter stuff like widgets, including your connector and dumb widgets. The **business**
directory holds the business layer stuff, including the store, state, and code to access the
database and to persist the state to disk.

```
├── business
│  ├── lib
│  ├── test
│  └── pubspec.yaml
└── client
    ├── lib
    ├── test
    └── pubspec.yaml
```

Edit the `client/pubspec.yaml` file to contain this:

```
dependencies:
  business:
    path: ../business/
```

However, `business/pubspec.yaml` should contain no references to the **client**. This guarantees
the **client** code can use the **business** code, but the **business** code can't access the
**client** code.

In `business/lib` create separate directories for your main features, and only then create
directories like `actions`, `models`, `dao` or other.

Note that AsyncRedux has no separate reducers nor middleware, so this simplifies the directory
structure in relation to vanilla Redux.

Your final directory structure would then look something like this:

```
├── business
│   ├── lib
│   │   ├── login
│   │   │   ├── actions
│   │   │   │   ├── login_action.dart
│   │   │   │   ├── logout_action.dart
│   │   │   │   └── ...
│   │   │   └── models
│   │   │       └── login_state.dart
│   │   ├── todos
│   │   │   ├── actions
│   │   │   │   └── ...
│   │   │   └── models
│   │   │       ├── todos_state.dart
│   │   │       └── todo.dart
│   │   └── users
│   │       ├── actions
│   │       │   ├── create_user_action.dart
│   │       │   ├── change_user_action.dart
│   │       │   ├── delete_user_action.dart
│   │       │   └── ...
│   │       └── models
│   │           └── user.dart
│   ├── test
│   │   ├── login
│   │   │   ├── login_STATE_test.dart
│   │   │   ├── login_action_test.dart
│   │   │   ├── logout_action_test.dart
│   │   │   └── ...
│   │   ├── todos
│   │   │   ├── todos_STATE_test.dart
│   │   │   └── todo_test.dart
│   │   └── users
│   │       └── user_test.dart
│   ├── pubspec.yaml
│   └── ...
└── client
    ├── lib
    │   ├── login
    │   │   ├── login_connector_widget.dart
    │   │   └── login_widget.dart
    │   └── todos
    │       ├── todos_connector_widget.dart
    │       └── todos_widget.dart
    ├── test
    │   ├── login
    │   │   ├── login_CONNECTOR_test.dart
    │   │   └── login_PRESENTATION.dart
    │   └── todos
    │       ├── todos_CONNECTOR_test.dart
    │       └── todos_PRESENTATION.dart
    └── pubspec.yaml
```
