const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const stripTrailingSlash = (s) => (typeof s === 'string' ? s.replace(/\/+$/, '') : s);

const config = {
  API_BASE_URL: stripTrailingSlash(rawApiBaseUrl),
  API_V1_STR: '/api/v1'
};

export default config;

