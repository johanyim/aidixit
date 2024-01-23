import { socketToNameMap, socketToRoomMap } from '../../server.js'
import { getIo } from '../socketSetup.js'

export function handleCreateRoom(socket, room, cb) {
    joinRoom(socket, room)
    cb(`Created and Joined ${room}`)
}

export function handleJoinRoom(socket, room, cb) {
    joinRoom(socket, room)
    if (cb) cb(`Joined ${room}`)
}

export function handleLeaveRoom(socket, cb) {
    leaveRoom(socket);
    cb(`Left room`);
}

export function handleGetRooms(cb) {
    const roomsInfo = []
    const allRooms = getIo().sockets.adapter.rooms;

    for (const [roomName, socketIds] of allRooms.entries()) {
        // Get the size of the Set to determine the number of sockets in the room
        const length = socketIds.size;

        if (length > 0) {
            roomsInfo.push({
                roomName: roomName,
                playerNames:[...socketIds].map(socketId =>socketToNameMap[socketId]),
                length: length
            });
        }
    }
    cb(roomsInfo)
}


function joinRoom(socket, room) {
    // Exit current room first
    if (socketToRoomMap[socket.id]) {
        leaveRoom(socket, false)
    }
    socket.join(room)
    socketToRoomMap[socket.id] = room;
}

function leaveRoom(socket, backToLobby=true) {
    const roomName = socketToRoomMap[socket.id];
    if (roomName) {
        socket.leave(roomName);
        delete socketToRoomMap[socket.id];
    }

    // // BUG: causes recursive call with joinRoom
    // // Back to lobby
    if(backToLobby) joinRoom(socket, 'lobby')
}
