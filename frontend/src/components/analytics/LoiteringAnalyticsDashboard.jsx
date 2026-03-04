import React from 'react';
import SecurityModuleAnalyticsDashboard from './SecurityModuleAnalyticsDashboard';

const LoiteringAnalyticsDashboard = ({ cameraId }) => (
    <SecurityModuleAnalyticsDashboard
        cameraId={cameraId}
        endpointPrefix="loitering"
        title="Loitering Detection"
        accentColor="#f59e0b"
        emptyText="No loitering events today"
    />
);

export default LoiteringAnalyticsDashboard;
