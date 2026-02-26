import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard'
import FaceRecognition from './components/face_rec/FaceRecognition'
import SettingsPage from './components/settings/SettingsPage'
import AnalyticsPage from './components/analytics/AnalyticsPage'
import ObjectDetection from './components/modules/ObjectDetection'
import PPECompliance from './components/modules/PPECompliance'
import MotionTracking from './components/modules/MotionTracking'
import HumanDetection from './components/modules/HumanDetection'
import FaceDetection from './components/modules/FaceDetection'
import CrowdDensity from './components/modules/CrowdDensity'
import AutoTracking from './components/modules/AutoTracking'
import LabourCounting from './components/modules/LabourCounting'
import PeopleCount from './components/modules/PeopleCount'
import EntryExitCount from './components/modules/EntryExitCount'
import IntrusionDetection from './components/modules/IntrusionDetection'
import LoiteringDetection from './components/modules/LoiteringDetection'
import LineCrossing from './components/modules/LineCrossing'
import CamerasPage from './components/CamerasPage'
import Login from './components/Login'
import AttendancePage from './components/AttendancePage'
import EvidencePage from './components/EvidencePage'
import AuditLogsPage from './components/AuditLogsPage'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'

import CameraDashboard from './components/camera/CameraDashboard';
import CameraModuleDetail from './components/camera/CameraModuleDetail';
import ErrorBoundary from './components/common/ErrorBoundary';

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected System Routes */}
      <Route path="/" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />

      {/* Camera Centric Routes */}
      <Route path="/cameras" element={<ProtectedRoute><ErrorBoundary><CamerasPage /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/cameras/:cameraId" element={<ProtectedRoute><CameraDashboard /></ProtectedRoute>} />
      <Route path="/cameras/:cameraId/module/:moduleType" element={<ProtectedRoute><CameraModuleDetail /></ProtectedRoute>} />

      <Route path="/face-recognition" element={<ProtectedRoute><FaceRecognition /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/object-detection" element={<ProtectedRoute><ObjectDetection /></ProtectedRoute>} />
      <Route path="/ppe-compliance" element={<ProtectedRoute><PPECompliance /></ProtectedRoute>} />
      <Route path="/motion-tracking" element={<ProtectedRoute><MotionTracking /></ProtectedRoute>} />
      <Route path="/human-detection" element={<ProtectedRoute><HumanDetection /></ProtectedRoute>} />
      <Route path="/face-detection" element={<ProtectedRoute><FaceDetection /></ProtectedRoute>} />
      <Route path="/crowd-density" element={<ProtectedRoute><CrowdDensity /></ProtectedRoute>} />
      <Route path="/auto-tracking" element={<ProtectedRoute><AutoTracking /></ProtectedRoute>} />
      <Route path="/labour-counting" element={<ProtectedRoute><LabourCounting /></ProtectedRoute>} />
      <Route path="/people-count" element={<ProtectedRoute><PeopleCount /></ProtectedRoute>} />
      <Route path="/entry-exit" element={<ProtectedRoute><EntryExitCount /></ProtectedRoute>} />
      <Route path="/intrusion-detection" element={<ProtectedRoute><IntrusionDetection /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/evidence" element={<ProtectedRoute><EvidencePage /></ProtectedRoute>} />
      <Route path="/loitering-detection" element={<ProtectedRoute><LoiteringDetection /></ProtectedRoute>} />
      <Route path="/line-crossing" element={<ProtectedRoute><LineCrossing /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
