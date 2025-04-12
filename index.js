const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let userCounter = 1;
var connectedUsers = {}

io.on('connection', (socket) => {

    const defaultUsername = `user${userCounter++}`;
    socket.username = defaultUsername;
    connectedUsers[socket.id] = defaultUsername;
    console.log(`User connected: ${socket.id} (Default: ${defaultUsername})`);

    socket.on('set username', (usernameObject) => {
        const newUsername = usernameObject.username;
        const socketId = usernameObject.socketId;
        const oldUsername = connectedUsers[socketId];
        delete connectedUsers[socketId];
        socket.username = newUsername;
        connectedUsers[socketId] = newUsername;

        notifyUsernameChange(socket, newUsername, oldUsername);
        console.log('set username: ' + newUsername);
    });

    socket.join("Default");
    socket.room = "Default";
    notifyJoinRoom(socket, "Default");
    // joinRoom(socket, defaultUsername, "Default")

    socket.on('get username', () => {
        socket.emit('set username client', {username: socket.username});
    });

    socket.on('check username', (newUsername) => {
        // console.log('Checking Username')
        // Username uniqueness check here
        if (connectedUsers[socket.id] !== newUsername) {
            if (Object.values(connectedUsers).includes(newUsername)) {
                socket.emit('username taken', { message: `'${newUsername}' is already in use.` });
                return;
            }

            else {
                socket.emit('username available');
            }
        }
    });

    socket.on('join room', (data) => {
        const newUsername = data.username;
        const newRoom = data.room;
        joinRoom(socket, newUsername, newRoom);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        notifyLeaveRoom(socket, socket.room);
        delete connectedUsers[socket.id];
    });

    socket.on('chat message', (data) => {
        console.log(`[${data.room}] ${data.username}: ${data.message}`);
        io.to(data.room).emit('chat message', data);;
    });

  });

  function joinRoom(socket, newUsername, newRoom) {

    if (socket.room !== newRoom) {
        if (socket.room) {
            socket.leave(socket.room);
            notifyLeaveRoom(socket, socket.room);
            console.log(`${socket.id} as ${socket.username} left room ${socket.room}`);
        }

        socket.join(newRoom);
        socket.room = newRoom;
        console.log(`${socket.id} as ${socket.username} joined room ${socket.room}`);
        notifyJoinRoom(socket, newRoom);
    }

    notifyAvailableRooms(socket)

  }

  function notifyJoinRoom(socket, room) {
    const roomUsers = io.sockets.adapter.rooms.get(room);
    const userCount = roomUsers ? roomUsers.size : 0;
    const usernames = roomUsers ? Array.from(roomUsers).map(id => connectedUsers[id]) : [];

    socket.emit('server message', { message: `You are now in ${room} (${userCount} users connected).`, room: room }); // 2.a
    socket.emit('server message', { message: `Users connected: ${usernames.join(', ')}`, room: room }); // 2.b

    socket.to(room).emit('server message', { message: `${socket.username} has joined ${room}. There are now ${userCount} users in the room.`, room: room }); // 2.c
}

function notifyLeaveRoom(socket, room) {
    const roomUsers = io.sockets.adapter.rooms.get(room);
    const userCount = roomUsers ? roomUsers.size : 0;

    socket.to(room).emit('server message', { message: `${socket.username} has left ${room}. There are now ${userCount} users in the room.`, room: room }); // 3.a
}

function notifyUsernameChange(socket, newUsername, oldUsername) {
    // console.log("Sending Notif")
    if (oldUsername) {
        socket.emit('server message', { message: `You are now known as ${newUsername}.`, room: socket.room }); // 4.a
        socket.to(socket.room).emit('server message', { message: `${oldUsername} is now known as ${newUsername}.`, room: socket.room }); // 4.b
    } else {
        socket.emit('server message', { message: `You are now known as ${newUsername}.`, room: socket.room }); // 1.b
    }
    console.log(`${socket.id} as ${oldUsername} is now known as ${newUsername} in room ${socket.room}.`)
}

function notifyAvailableRooms(socket) {
    const rooms = io.sockets.adapter.rooms;
    const roomCounts = [];

    for (const [room, users] of rooms.entries()) {
        if (!users.has(room)) { // Filter out socket IDs
            roomCounts.push(`${room} (${users.size})`);
        }
    }

    socket.emit('server message', { message: `Available chatrooms: ${roomCounts.join('; ')}`, room: socket.room }); // 1.c
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});