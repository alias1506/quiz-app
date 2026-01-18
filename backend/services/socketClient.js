/**
 * WebSocket Client for User App
 * Connects to Admin backend and emits user activity events
 */

const { io } = require("socket.io-client");

let socket = null;

const initializeSocket = () => {
    // Admin backend WebSocket URL
    const adminSocketURL = process.env.ADMIN_SOCKET_URL || "http://localhost:8000";

    socket = io(adminSocketURL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ["websocket"], // Skip polling to avoid 'xhr poll error' on Render
    });

    socket.on("connect", () => {
        console.log("✅ Connected to Admin WebSocket Server");
    });

    socket.on("disconnect", () => {
        console.log("❌ Disconnected from Admin WebSocket Server");
    });

    socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error.message);
    });

    return socket;
};

const getSocket = () => {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
};

// Emit events to admin dashboard
const emitUserJoined = (userData) => {
    const sock = getSocket();
    if (sock && sock.connected) {
        sock.emit("user:joined", userData);
        console.log("📤 Emitted: user:joined", userData.email);
    }
};

const emitAttemptStarted = (attemptData) => {
    const sock = getSocket();
    if (sock && sock.connected) {
        sock.emit("user:attemptStarted", attemptData);
        console.log("📤 Emitted: user:attemptStarted", attemptData.email);
    }
};

const emitScoreUpdated = (scoreData) => {
    const sock = getSocket();
    if (sock && sock.connected) {
        sock.emit("user:scoreUpdated", scoreData);
        console.log("📤 Emitted: user:scoreUpdated", scoreData.email);
    }
};

module.exports = {
    initializeSocket,
    getSocket,
    emitUserJoined,
    emitAttemptStarted,
    emitScoreUpdated,
};
