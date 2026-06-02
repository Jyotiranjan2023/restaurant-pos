import axios from 'axios'

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  // No default Content-Type — let axios decide per request
})

// Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Set Content-Type to JSON for non-FormData requests
    // FormData requests will get multipart/form-data with boundary auto-set by browser
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Global handler for upgrade modal trigger (set by UpgradeModalProvider)
let globalUpgradeModalTrigger = null

export const setUpgradeModalTrigger = (trigger) => {
  globalUpgradeModalTrigger = trigger
}

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // 401 — token expired
    if (status === 401) {
      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // 402 — feature gate triggered (subscription limit reached)
    if (status === 402) {
      const responseData = error.response?.data
      const gateData = responseData?.data || {}

      if (globalUpgradeModalTrigger) {
        globalUpgradeModalTrigger({
          message: responseData?.message || 'This feature requires an upgrade',
          featureCode: gateData.featureCode,
          currentPlan: gateData.currentPlan,
          suggestedPlan: gateData.suggestedPlan,
        })
      }
    }

    return Promise.reject(error)
  }
)

export default api