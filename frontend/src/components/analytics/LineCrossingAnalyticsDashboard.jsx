import React from 'react';
import SecurityModuleAnalyticsDashboard from './SecurityModuleAnalyticsDashboard';

const LineCrossingAnalyticsDashboard = ({ cameraId }) => (
    <SecurityModuleAnalyticsDashboard
        cameraId={cameraId}
        endpointPrefix="line-crossing"
        title="Line Crossing"
        accentColor="#3b82f6"
        emptyText="No line crossing events today"
    />
);

export default LineCrossingAnalyticsDashboard;
