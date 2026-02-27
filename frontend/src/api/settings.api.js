import httpClient from './httpClient';

const settingsApi = {
    getSetting: (key) => httpClient.get(`/settings/${key}`),
    updateSetting: (key, value) => httpClient.post(`/settings/${key}`, { value: JSON.stringify(value) }),
};

export default settingsApi;
