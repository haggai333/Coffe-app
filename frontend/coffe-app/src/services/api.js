const BASE_URL = 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(method, path, body = null) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const options = { method, headers, ...(body && { body: JSON.stringify(body) }) }
  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export const productsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request('GET', `/products${query ? '?' + query : ''}`)
  },
  getById: (id) => request('GET', `/products/${id}`),
}

export const ordersAPI = {
  place: (orderData) => request('POST', '/orders', orderData),
  getAll: () => request('GET', '/orders'),
  getById: (id) => request('GET', `/orders/${id}`),
}
