import httpClient from './httpClient';
import camerasApi from './cameras.api';

// Since backend interaction for specific modules is limited (mostly just query params on stream),
// we will abstract the "Module Configuration" here.
// Ideally, this calls POST /api/cameras/:id/modules

const modulesApi = {
    // Get enabled modules for a camera
    getForCamera: async (cameraId) => {
        const response = await httpClient.get(`/cameras/${cameraId}/modules`);
        return response.data || [];
    },

    // Enable/Disable a module
    toggleModule: async (cameraId, moduleKey, active) => {
        // Backend strictly controls state
        const status = active ? 'active' : 'paused';
        const response = await httpClient.patch(`/cameras/${cameraId}/modules/${moduleKey}`, {
            enabled: active,
            status: status
        });
        return response.data;
    },

    // Update module config
    updateConfig: async (cameraId, moduleKey, config) => {
        // We can reuse the PATCH endpoint, or if we need a specific config endpoint, defaulting to PATCH
        const response = await httpClient.patch(`/cameras/${cameraId}/modules/${moduleKey}`, {
            enabled: true, // Config update usually implies active, or we check current?
            status: 'active', // For now, assume active if configuring
            config: config
        });
        return response.data;
    }
};

export default modulesApi;
