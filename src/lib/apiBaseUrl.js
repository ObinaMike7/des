const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL =
  configuredBaseUrl === undefined
    ? (import.meta.env.PROD ? '' : 'http://localhost:5000')
    : configuredBaseUrl
