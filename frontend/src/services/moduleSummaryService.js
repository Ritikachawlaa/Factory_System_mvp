import httpClient from '../api/httpClient';

/**
 * Resolves high-level summary statistics for a given module on a specific camera.
 * Fetches REAL data from Backend.
 */
export const getModuleSummary = async (cameraId, moduleKey) => {
    try {
        const response = await httpClient.get(`/stats/camera/${cameraId}/module/${moduleKey}`);
        const data = response.data;

        // { event_count: 0, last_event: null, status: 'active' }

        return {
            primary: { label: 'Events Today', value: data.event_count || 0 },
            secondary: { label: 'Status', value: data.status || 'Unknown' },
            status: data.status || 'unknown',
            lastEvent: data.last_event ? new Date(data.last_event).toLocaleTimeString() : 'None'
        };
    } catch (error) {
        console.warn(`Failed to fetch stats for ${moduleKey}:`, error);
        return {
            primary: { label: 'Events', value: '-' },
            secondary: { label: 'Status', value: 'Error' },
            status: 'error',
            lastEvent: '-'
        };
    }
};
