import httpClient from '../api/httpClient';

/**
 * Resolves high-level summary statistics for a given module on a specific camera.
 * Fetches REAL data from Backend.
 */
export const getModuleSummary = async (cameraId, moduleKey) => {
    try {
        const response = await httpClient.get(`/stats/camera/${cameraId}/module/${moduleKey}`);
        const data = response.data;

        if (!data || typeof data !== 'object') {
            return {
                primary: { label: 'Events Today', value: 0 },
                secondary: { label: 'Status', value: 'Unknown' },
                status: 'unknown',
                lastEvent: 'None'
            };
        }

        return {
            primary: { label: 'Events Today', value: data.event_count || 0 },
            secondary: { label: 'Status', value: data.status || 'Unknown' },
            status: data.status || 'unknown',
            lastEvent: data.last_event ? new Date(data.last_event).toLocaleTimeString() : 'None'
        };
    } catch (error) {
        // Silently handle — modules without stats are normal
        return {
            primary: { label: 'Events', value: '-' },
            secondary: { label: 'Status', value: '-' },
            status: 'unknown',
            lastEvent: '-'
        };
    }
};
