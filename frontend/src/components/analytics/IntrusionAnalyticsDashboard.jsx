import React from 'react';
import SecurityModuleAnalyticsDashboard from './SecurityModuleAnalyticsDashboard';

const IntrusionAnalyticsDashboard = ({ cameraId }) => (
    <SecurityModuleAnalyticsDashboard
        cameraId={cameraId}
        endpointPrefix="intrusion"
        title="Intrusion Detection"
        accentColor="#ef4444"
        emptyText="No intrusion events today"
    />
);

export default IntrusionAnalyticsDashboard;
