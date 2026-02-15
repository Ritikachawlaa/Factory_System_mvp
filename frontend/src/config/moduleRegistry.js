import FaceRecognitionPanel from '../components/panels/FaceRecognitionPanel';
import PPECompliancePanel from '../components/panels/PPECompliancePanel';

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
    'fire-smoke': {
        key: 'fire-smoke',
        label: 'Fire & Smoke',
        icon: '🔥',
        panelComponent: null,
        description: 'Early warning system for fire and smoke hazards.',
        supportsAlerts: true,
        supportsStats: false,
        permissions: {
            view: ['admin', 'supervisor', 'operator', 'viewer'],
            control: ['admin'] // Critical - Admin Only
        }
    },
    'vehicle-anpr': {
        key: 'vehicle-anpr',
        label: 'Vehicle/ANPR',
        icon: '🚗',
        panelComponent: null,
        description: 'License plate recognition and vehicle tracking.',
        supportsAlerts: true,
        supportsStats: true
    },
    'animal-detection': {
        key: 'animal-detection',
        label: 'Animal Detection',
        icon: '🐕',
        panelComponent: null,
        description: 'Detect wild or stray animals in premises.',
        supportsAlerts: true,
        supportsStats: false
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
    'box-production': {
        key: 'box-production',
        label: 'Box Production',
        icon: '🏭',
        panelComponent: null,
        description: 'Count production line output.',
        supportsAlerts: false,
        supportsStats: true
    },
    'fault-detection': {
        key: 'fault-detection',
        label: 'Fault Detection',
        icon: '🔧',
        panelComponent: null,
        description: 'Identify equipment faults or anomalies.',
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
    'fight-detection': {
        key: 'fight-detection',
        label: 'Fight Detection',
        icon: '👊',
        panelComponent: null,
        description: 'Detect aggressive behavior or fights.',
        supportsAlerts: true,
        supportsStats: false
    },
    'camera-tampering': {
        key: 'camera-tampering',
        label: 'Camera Tampering',
        icon: '📹',
        panelComponent: null,
        description: 'Alert on camera obstruction or movement.',
        supportsAlerts: true,
        supportsStats: false
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
