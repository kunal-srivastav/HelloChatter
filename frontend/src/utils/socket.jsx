import { io } from "socket.io-client";

console.log("Base url in socket", import.meta.env.VITE_SOCKET_URL);
export const socket = io(import.meta.env.VITE_SOCKET_URL);