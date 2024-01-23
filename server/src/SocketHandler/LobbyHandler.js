import { handleIO } from "./IOHandler.js";

import {
    handleNameSet,
} from '../game.js';
import { socketToNameMap } from "../../server.js";


export function handleSetName(socket, name) {
    socketToNameMap[socket.id] = name
    //This line Will be remove later
    const res = handleNameSet(socket, name)
    handleIO(socket, res)
}
