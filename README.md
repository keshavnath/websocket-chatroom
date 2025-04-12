# Real-time Chatroom Application

A real-time multi-room chat application using websockets built with Node.js, Express, and Socket.IO.

# DISCLAIMER

This was part of a university assignment. If you copy this for your assignment, you are likely to get flagged for plagiarism.

## Features

- Real-time messaging across multiple chatrooms
- Dynamic username management
- Room-based chat system
- User presence notifications
- Server status messages
- Unique username validation
- Room switching capabilities

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install express@4.21.2 socket.io@4.8.1
```

## Running the Application

Start the server:
```bash
node index.js
```

The application will be available at `http://localhost:3000`

## Usage

1. When you first connect, you'll be assigned a default username (e.g., user1)
2. Click the "Show/Hide Form" button to set your custom username and join a room
3. Enter your desired username and room name
4. Click "Join Chat" to enter the chatroom
5. Start sending messages!

## Features in Detail

### Chat Rooms
- Users can create and join different chat rooms
- Each room maintains its own separate chat history
- Users can see the number of participants in each room

### Username Management
- Automatic assignment of temporary usernames
- Option to choose custom usernames
- Username uniqueness validation
- Notifications when users change their names

### Real-time Updates
- Instant message delivery
- Join/leave notifications
- Room participant updates
- Username change broadcasts

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **Server**: HTTP Server with Socket.IO integration

## License

ISC