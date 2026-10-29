const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://qv7m2xk9.onrender.com';const DEFAULT_TIMEOUT_MS = 10000;

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s while contacting ${url}`);
    }
    throw err;
  }
}

export const forecastApi = {
  getBaseUrl() {
    return API_BASE_URL;
  },


  async checkHealth() {
    return request('/health');
  },

  async getMetrics() {
    return request('/metrics');
  },

  async getDailySummary() {
    return request('/daily-summary');
  },

  async getComparisons({ deliveryDate = null, limit = 1000, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (deliveryDate) {
      params.append('delivery_date', deliveryDate);
    }
    if (limit) {
      params.append('limit', String(limit));
    }
    if (offset) {
      params.append('offset', String(offset));
    }

    const query = params.toString();
    const endpoint = `/comparisons${query ? `?${query}` : ''}`;
    return request(endpoint);
  },
};
