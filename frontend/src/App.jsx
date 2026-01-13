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
import LicensePlateRecognition from './components/modules/LicensePlateRecognition'
import CamerasPage from './components/CamerasPage'
import Login from './components/Login'

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
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/cameras" element={<ProtectedRoute><CamerasPage /></ProtectedRoute>} />
      <Route path="/face-recognition" element={<ProtectedRoute><FaceRecognition /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/object-detection" element={<ProtectedRoute><ObjectDetection /></ProtectedRoute>} />
      <Route path="/ppe-compliance" element={<ProtectedRoute><PPECompliance /></ProtectedRoute>} />
      <Route path="/motion-tracking" element={<ProtectedRoute><MotionTracking /></ProtectedRoute>} />
      <Route path="/lpr" element={<ProtectedRoute><LicensePlateRecognition /></ProtectedRoute>} />
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
