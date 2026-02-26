import FaceRecognitionPanel from '../components/panels/FaceRecognitionPanel';
import PPECompliancePanel from '../components/panels/PPECompliancePanel';
import AutoTrackingPanel from '../components/panels/AutoTrackingPanel';

// Single source of truth for AI Modules
export const MODULE_REGISTRY = {
    'face-recognition': {
        key: 'face-recognition',
        label: 'Face Recognition',
        icon: '👤',
        panelComponent: FaceRecognitionPanel,
        description: 'Identify authorized personnel and detect strangers.',
        supportsAlerts: true,
        supportsStats: true,
        permissions: {
            view: ['admin', 'supervisor', 'operator', 'viewer'],
            control: ['admin', 'supervisor']
        }
    },
    'ppe-detection': {
        key: 'ppe-detection',
        label: 'PPE Compliance',
        icon: '🦺',
        panelComponent: PPECompliancePanel,
        description: 'Detect safety gear violations (Helmets, Vests).',
        supportsAlerts: true,
        supportsStats: true,
        permissions: {
            view: ['admin', 'supervisor', 'operator', 'viewer'],
            control: ['admin', 'supervisor']
        }
    },
    'object-detection': {
        key: 'object-detection',
        label: 'Object Detection',
        icon: '📦',
        panelComponent: null, // Placeholder for now
        description: 'Detect and classify objects like boxes, vehicles, etc.',
        supportsAlerts: true,
        supportsStats: false
    },
    'intrusion-detection': {
        key: 'intrusion-detection',
        label: 'Intrusion Detection',
        icon: '🚨',
        panelComponent: null,
        description: 'Monitor prohibited areas for unauthorized movement.',
        supportsAlerts: true,
        supportsStats: true,
        permissions: {
            view: ['admin', 'supervisor', 'operator'],
            control: ['admin', 'supervisor']
        }
    },
    'object-detection-abandoned': {
        key: 'object-detection-abandoned',
        label: 'Object/Abandoned',
        icon: '📦',
        panelComponent: null,
        description: 'Detect abandoned objects or specific items.',
        supportsAlerts: true,
        supportsStats: false
    },
    'loitering-detection': {
        key: 'loitering-detection',
        label: 'Loitering Detection',
        icon: '🚶',
        panelComponent: null,
        description: 'Alert when persons linger in a zone too long.',
        supportsAlerts: true,
        supportsStats: true
    },
    'people-count': {
        key: 'people-count',
        label: 'People Count',
        icon: '👥',
        panelComponent: null,
        description: 'Count foot traffic and occupancy.',
        supportsAlerts: false,
        supportsStats: true
    },
    'line-crossing': {
        key: 'line-crossing',
        label: 'Line Crossing',
        icon: '🚧',
        panelComponent: null,
        description: 'Detect crossing of virtual tripwires.',
        supportsAlerts: true,
        supportsStats: true
    },
    'entry-exit': {
        key: 'entry-exit',
        label: 'Entry/Exit',
        icon: '🚪',
        panelComponent: null,
        description: 'Monitor entry and exit points.',
        supportsAlerts: true,
        supportsStats: true
    },
    'human-detection': {
        key: 'human-detection',
        label: 'Human Detection',
        icon: '🧍',
        panelComponent: null,
        description: 'Detect and track human presence in camera feeds.',
        supportsAlerts: true,
        supportsStats: true
    },
    'face-detection': {
        key: 'face-detection',
        label: 'Face Detection',
        icon: '😊',
        panelComponent: null,
        description: 'Detect and locate faces in camera feeds.',
        supportsAlerts: true,
        supportsStats: true
    },
    'crowd-density': {
        key: 'crowd-density',
        label: 'Crowd Density',
        icon: '👨‍👩‍👧‍👦',
        panelComponent: null,
        description: 'Analyze crowd density and congestion levels.',
        supportsAlerts: true,
        supportsStats: true
    },
    'auto-tracking': {
        key: 'auto-tracking',
        label: 'Auto Tracking',
        icon: '🎯',
        panelComponent: AutoTrackingPanel,
        description: 'Automatically track and follow objects or persons.',
        supportsAlerts: false,
        supportsStats: true
    },
    'labour-counting': {
        key: 'labour-counting',
        label: 'Labour Counting',
        icon: '👷',
        panelComponent: null,
        description: 'Count and monitor workforce on site.',
        supportsAlerts: false,
        supportsStats: true
    },
    'heatmap': {
        key: 'heatmap',
        label: 'Crowd Heatmap',
        icon: '🔥',
        panelComponent: null, // Todo: Add panel
        description: 'Visualize crowd density and movement patterns.',
        supportsAlerts: false,
        supportsStats: false,
        permissions: {
            view: ['admin', 'supervisor', 'operator', 'viewer'],
            control: ['admin', 'supervisor']
        }
    }
};

export const getModuleConfig = (key) => MODULE_REGISTRY[key] || null;
export const getAllModules = () => Object.values(MODULE_REGISTRY);
