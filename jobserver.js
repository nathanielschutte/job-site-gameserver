
// store connected sockets in 'player' which is part of game state
// store persisting user data in 'playerData'

// handle projectiles as 'events' that can be resimulated on the server
// projectile interactions calculated on the server, results sent to clients including sender


const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    pingInterval: 10000,
    transports: ['websocket']
});

const { rooms, events, sprite, error } = require('./common/constants');
const { Player } = require('./common/objects/Player');
const { Level } = require('./common/objects/Level');
const { Projectile } = require('./common/objects/Projectile');

// Server state
// Level
const level = new Level();

// Connected players by socket id
const players = {};

// Projectiles
const proj = {};


// Storage
// Persistent player data...not sure for what yet
const playerData = {};


// Authentication by token middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token && checkToken(token)) {
        next();
    }
    else {
        next(new Error(error.BAD_TOKEN));
    }
});


// Socket connection
io.on(events.CONNECT, socket => {

    playerConnect(socket);


    socket.on(events.DISCONNECT, () => {
        playerDisconnect(socket);
    });

    socket.on(events.ERROR, (err) => {
        let msg = '';
        let fatal = false;
        if (err) {
            if (err.message === error.UNAUTH_EVENT) {
                msg = 'unauthorized event';
            }
            else if(err.message === error.BAD_TOKEN) {
                msg = 'bad token';
            }
        }
        if (msg !== '') {
            socket.emit(events.ERROR_MSG, msg);
        }

        if (fatal) {
            socket.disconnect();
        }
    });
});


// On socket connect
function playerConnect(socket) {
    console.log('player connected: ', socket.id);

    let data = socket.handshake.query;

    if (!data || !data.id) {
        socket.emit(events.ERROR_MSG, 'no player data given');
        socket.disconnect();
    }

    socket.join(rooms.CHAT_ALL);
    socket.join(rooms.TREAM_ALL);

    players[socket.id] = {
        player: new Player(data.name, sprite.WIDTH, sprite.HEIGHT),
        id: data.id,
        name: data.name
    };

    updatePlayerData(socket);
    let playerStore = getPlayerData(data.id);

    if (playerStore) {
        console.log('user: ', data.name, `[${data.id}]`, 'connected', playerStore.connectionCount, 'times');
    }

    sendChatMessage(rooms.CHAT_ALL, 'hello from the server!');
    sendChatMessage(rooms.CHAT_ALL, `hello from ${players[socket.id].name}!`, socket);
}


// On socket disconnect
function playerDisconnect(socket) {
    console.log('client disconnected', socket.id);



    delete players[socket];
}


// Send message to chat room
// If a socket is passed, omit it from room broadcast
function sendChatMessage(room, message, socket) {
    if (socket) {
        console.log(players[socket.id].name, 'sending message to', room, ': ', message);
        socket.to(room).emit(events.CHAT_MESSAGE, message);
    }
    else {
        console.log('server sending message to', room, ': ', message);
        io.in(room).emit(events.CHAT_MESSAGE, message);
    }
}


// Store user data
function updatePlayerData(socket) {
    player = players[socket.id];
    if (!playerData[player.id]) {
        playerData[player.id] = { connectionCount: 0 };
    }
    playerData[player.id].connectionCount += 1;
}


// Get user data from storage
function getPlayerData(userId) {
    if (!playerData[userId]) {
        return null;
    }

    return playerData[userId];
}


function checkToken(token) {
    return token === 'password';
}



const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Jobsite server running on port ${PORT}`));