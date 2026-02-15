/**
 * MOCK Audit Log Service
 * Stores system actions locally for demonstration.
 */

const STORAGE_KEY = 'audit_logs';

const getStoredLogs = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
};

export const AuditLogService = {
    /**
     * Log a new action
     */
    logAction: (user, action, detail, meta = {}, severity = 'Low') => {
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user: typeof user === 'string' ? user : (user?.username || 'unknown'),
            role: user?.role || 'system',
            action,
            detail,
            meta,
            severity
        };

        const logs = getStoredLogs();
        logs.unshift(newLog);
        // Limit to last 100 logs
        if (logs.length > 100) logs.pop();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        console.log('[AUDIT]', newLog);
    },

    /**
     * Get logs with optional filters
     */
    getLogs: async (filters = {}) => {
        // Simulate misc network delay for realism if desired, or instant
        const logs = getStoredLogs();

        return logs.filter(log => {
            if (filters.user && !log.user.includes(filters.user)) return false;
            if (filters.action && log.action !== filters.action) return false;
            return true;
        });
    }
};
