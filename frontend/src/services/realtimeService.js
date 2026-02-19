import analyticsApi from '../api/analytics.api';
import camerasApi from '../api/cameras.api';
import API_BASE_URL from '../config';

const API_BASE = API_BASE_URL;

const WS_URL = (API_BASE || "")
    .replace("https://", "wss://")
    .replace("http://", "ws://") + "/ws/events";


let socket = null;
let reconnectInterval = null;

const listeners = {}; // { [cameraId]: [cb, cb] }

// Helper to notify listeners
function broadcast(cameraId, event) {
    // Notify specific camera listeners
    if (listeners[cameraId]) {
        listeners[cameraId].forEach(cb => cb(event));
    }
    // Notify 'global' listeners (cameraId = 'all')
    if (listeners['all']) {
        listeners['all'].forEach(cb => cb(event));
    }
}

function connectWebSocket() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    console.log("Connecting to Signaling WebSocket...");
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
        console.log("Signaling WebSocket Connected");
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    };

    socket.onmessage = (message) => {
        try {
            const payload = JSON.parse(message.data);
            handleServerMessage(payload);
        } catch (e) {
            console.error("Failed to parse WS message", e);
        }
    };

    socket.onclose = () => {
        console.log("Signaling WebSocket Disconnected, reconnecting...");
        socket = null;
        if (!reconnectInterval) {
            reconnectInterval = setInterval(connectWebSocket, 3000);
        }
    };

    socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
    };
}

function handleServerMessage(payload) {
    // payload: { type: "MODULE_UPDATE", data: { ... } }
    const { type, data } = payload;

    if (type === 'MODULE_UPDATE') {
        // Map to frontend expectation
        broadcast(data.cameraId, {
            type: 'STATUS_CHANGE',
            data: {
                moduleKey: data.moduleKey,
                status: data.status,
                timestamp: data.timestamp
            }
        });
    } else if (type === 'ALERT' || type === 'EVENT') {
        // Backend might send generic events
        broadcast(data.camera_id || 'all', {
            type: 'ALERT',
            data: {
                id: data.id,
                title: data.message || 'Alert',
                severity: data.severity || 'info',
                timestamp: data.timestamp
            }
        });
    }
}

// Initialize Connection
connectWebSocket();

export const RealtimeService = {
    subscribe: (cameraId, callback) => {
        if (!listeners[cameraId]) {
            listeners[cameraId] = [];
        }
        listeners[cameraId].push(callback);
    },

    unsubscribe: (cameraId, callback) => {
        if (!listeners[cameraId]) return;
        listeners[cameraId] = listeners[cameraId].filter(cb => cb !== callback);
    },

    setModuleStatus: async (cameraId, moduleKey, status) => {
        // Optimistic update
        console.log(`Optimistic update for ${moduleKey}: ${status}`);
        // We rely on modulesApi to send PATCH, which triggers WebSocket MODULE_UPDATE
    },

    getModuleStatus: () => {
        return 'active'; // Default, component should fetch real status via API
    }
};
export default API_BASE;