import React from 'react';
import SecurityModuleAnalyticsDashboard from './SecurityModuleAnalyticsDashboard';

const EntryExitAnalyticsDashboard = ({ cameraId }) => (
    <SecurityModuleAnalyticsDashboard
        cameraId={cameraId}
        endpointPrefix="entry-exit"
        title="Entry Exit"
        accentColor="#22c55e"
        emptyText="No entry or exit events today"
    />
);

export default EntryExitAnalyticsDashboard;
