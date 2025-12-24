# Messaging Module

The `messaging` module facilitates secure, internal communication between users (Admins, Teachers, Students, Parents).

## Features

*   **Threaded Conversations**: Messages are grouped into threads by subject and participants.
*   **Real-time Updates**: (Planned) WebSocket integration for instant delivery.
*   **Unread Tracking**: Per-user read status for every message.
*   **Attachments**: Support for file attachments (images, sheet music).

## Data Model

### MessageThread
Represents a conversation container.
*   `participants`: ManyToManyField to User.
*   `subject`: String.

### Message
An individual message within a thread.
*   `thread`: ForeignKey to MessageThread.
*   `sender`: ForeignKey to User.
*   `body`: Text content.
*   `read_by`: ManyToManyField to User (tracks who has seen the message).

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/messaging/threads/` | List threads for current user. |
| `POST` | `/api/messaging/threads/` | Create a new thread. |
| `GET` | `/api/messaging/threads/{id}/messages/` | Get messages in a thread. |
| `POST` | `/api/messaging/threads/{id}/reply/` | Reply to a thread. |
