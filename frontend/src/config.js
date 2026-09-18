const defaultUrl = import.meta.env.PROD ? '' : 'http://localhost:8000';
const rawApiBaseUrl = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '' ? import.meta.env.VITE_API_URL : defaultUrl;

const stripTrailingSlash = (s) => (typeof s === 'string' ? s.replace(/\/+$/, '') : s);

const config = {
  API_BASE_URL: stripTrailingSlash(rawApiBaseUrl),
  API_V1_STR: '/api/v1'
};

export default config;

