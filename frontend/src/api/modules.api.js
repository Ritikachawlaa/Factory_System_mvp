import httpClient from './httpClient';
import camerasApi from './cameras.api';

// Since backend interaction for specific modules is limited (mostly just query params on stream),
// we will abstract the "Module Configuration" here.
// Ideally, this calls POST /api/cameras/:id/modules

const modulesApi = {
    // Get enabled modules for a camera
    getForCamera: (cameraId) => httpClient.get(`/cameras/${cameraId}/modules`),

    // Enable/Disable a module
    toggleModule: (cameraId, moduleKey, active) => {
        const status = active ? 'active' : 'paused';
        return httpClient.patch(`/cameras/${cameraId}/modules/${moduleKey}`, {
            enabled: active,
            status: status
        });
    },

    // Update module config
    updateConfig: (cameraId, moduleKey, config) => {
        return httpClient.patch(`/cameras/${cameraId}/modules/${moduleKey}`, {
            enabled: true,
            status: 'active',
            config: config
        });
    }
};

export default modulesApi;
