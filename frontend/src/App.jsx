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
import FaultDetection from './components/modules/FaultDetection'
import FightDetection from './components/modules/FightDetection'
import CameraTampering from './components/modules/CameraTampering'
import BoxProduction from './components/modules/BoxProduction'
import PeopleCount from './components/modules/PeopleCount'
import EntryExitCount from './components/modules/EntryExitCount'
import IntrusionDetection from './components/modules/IntrusionDetection'
import AnimalDetection from './components/modules/AnimalDetection'
import LoiteringDetection from './components/modules/LoiteringDetection'
import LineCrossing from './components/modules/LineCrossing'
import FireSmokeDetection from './components/modules/FireSmokeDetection'
import CamerasPage from './components/CamerasPage'
import Login from './components/Login'
import AttendancePage from './components/AttendancePage'
import SubscriptionPage from './components/SubscriptionPage'
import EvidencePage from './components/EvidencePage'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'

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
      <Route path="/fault-detection" element={<ProtectedRoute><FaultDetection /></ProtectedRoute>} />
      <Route path="/fight-detection" element={<ProtectedRoute><FightDetection /></ProtectedRoute>} />
      <Route path="/camera-tampering" element={<ProtectedRoute><CameraTampering /></ProtectedRoute>} />
      <Route path="/box-production" element={<ProtectedRoute><BoxProduction /></ProtectedRoute>} />
      <Route path="/people-count" element={<ProtectedRoute><PeopleCount /></ProtectedRoute>} />
      <Route path="/entry-exit" element={<ProtectedRoute><EntryExitCount /></ProtectedRoute>} />
      <Route path="/entry-exit" element={<ProtectedRoute><EntryExitCount /></ProtectedRoute>} />
      <Route path="/intrusion-detection" element={<ProtectedRoute><IntrusionDetection /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
      <Route path="/evidence" element={<ProtectedRoute><EvidencePage /></ProtectedRoute>} />
      <Route path="/animal-detection" element={<ProtectedRoute><AnimalDetection /></ProtectedRoute>} />
      <Route path="/loitering-detection" element={<ProtectedRoute><LoiteringDetection /></ProtectedRoute>} />
      <Route path="/line-crossing" element={<ProtectedRoute><LineCrossing /></ProtectedRoute>} />
      <Route path="/fire-smoke" element={<ProtectedRoute><FireSmokeDetection /></ProtectedRoute>} />
      <Route path="/evidence" element={<ProtectedRoute><EvidencePage /></ProtectedRoute>} />
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
