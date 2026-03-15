import FaceRecognitionPanel from '../components/panels/FaceRecognitionPanel';
import PPECompliancePanel from '../components/panels/PPECompliancePanel';
import AutoTrackingPanel from '../components/panels/AutoTrackingPanel';
import FaceDetectionPanel from '../components/panels/FaceDetectionPanel';
import CrowdDensityPanel from '../components/panels/CrowdDensityPanel';
import EntryExitPanel from '../components/panels/EntryExitPanel';
import LineCrossingPanel from '../components/panels/LineCrossingPanel';
import LabourCountingPanel from '../components/panels/LabourCountingPanel';
import LoiteringDetectionPanel from '../components/panels/LoiteringDetectionPanel';
import IntrusionDetectionPanel from '../components/panels/IntrusionDetectionPanel';
import HeatMapPanel from '../components/panels/HeatMapPanel';
import HumanDetectionPanel from '../components/panels/HumanDetectionPanel';
import PeopleCountPanel from '../components/panels/PeopleCountPanel';

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
            view: ['superadmin', 'admin', 'supervisor', 'operator', 'viewer'],
            control: ['superadmin', 'admin', 'supervisor']
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
            view: ['superadmin', 'admin', 'supervisor', 'operator', 'viewer'],
            control: ['superadmin', 'admin', 'supervisor']
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
        panelComponent: IntrusionDetectionPanel,
        description: 'Monitor prohibited areas for unauthorized movement.',
        supportsAlerts: true,
        supportsStats: true,
        permissions: {
            view: ['superadmin', 'admin', 'supervisor', 'operator'],
            control: ['superadmin', 'admin', 'supervisor']
        }
    },
    'object-abandonment': {
        key: 'object-abandonment',
        label: 'Abandoned Objects',
        icon: '📦',
        panelComponent: null,
        description: 'Detect abandoned objects in restricted zones.',
        supportsAlerts: true,
        supportsStats: false
    },
    'object-removal': {
        key: 'object-removal',
        label: 'Removed Objects',
        icon: '📦',
        panelComponent: null,
        description: 'Detect removal of specific items from original context.',
        supportsAlerts: true,
        supportsStats: false
    },
    'loitering-detection': {
        key: 'loitering-detection',
        label: 'Loitering Detection',
        icon: '🚶',
        panelComponent: LoiteringDetectionPanel,
        description: 'Alert when persons linger in a zone too long.',
        supportsAlerts: true,
        supportsStats: true
    },
    'people-count': {
        key: 'people-count',
        label: 'People Count',
        icon: '👥',
        panelComponent: PeopleCountPanel,
        description: 'Count foot traffic and occupancy.',
        supportsAlerts: false,
        supportsStats: true
    },
    'line-crossing': {
        key: 'line-crossing',
        label: 'Line Crossing',
        icon: '🚧',
        panelComponent: LineCrossingPanel,
        description: 'Detect crossing of virtual tripwires.',
        supportsAlerts: true,
        supportsStats: true
    },
    'entry-exit': {
        key: 'entry-exit',
        label: 'Entry/Exit',
        icon: '🚪',
        panelComponent: EntryExitPanel,
        description: 'Monitor entry and exit points.',
        supportsAlerts: true,
        supportsStats: true
    },
    'human-detection': {
        key: 'human-detection',
        label: 'Human Detection',
        icon: '🧍',
        panelComponent: HumanDetectionPanel,
        description: 'Detect and track human presence in camera feeds.',
        supportsAlerts: true,
        supportsStats: true
    },
    'face-detection': {
        key: 'face-detection',
        label: 'Face Detection',
        icon: '😊',
        panelComponent: FaceDetectionPanel,
        description: 'Detect and locate faces in camera feeds.',
        supportsAlerts: true,
        supportsStats: true
    },
    'crowd-density': {
        key: 'crowd-density',
        label: 'Crowd Density',
        icon: '👨‍👩‍👧‍👦',
        panelComponent: CrowdDensityPanel,
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
        panelComponent: LabourCountingPanel,
        description: 'Count and monitor workforce on site.',
        supportsAlerts: false,
        supportsStats: true
    },
    'heatmap': {
        key: 'heatmap',
        label: 'Crowd Heatmap',
        icon: '🔥',
        panelComponent: HeatMapPanel,
        description: 'Visualize crowd density and movement patterns.',
        supportsAlerts: false,
        supportsStats: false,
        permissions: {
            view: ['superadmin', 'admin', 'supervisor', 'operator', 'viewer'],
            control: ['superadmin', 'admin', 'supervisor']
        }
    }
};

export const getModuleConfig = (key) => MODULE_REGISTRY[key] || null;
export const getAllModules = () => Object.values(MODULE_REGISTRY);
