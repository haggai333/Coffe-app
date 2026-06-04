import { createContext, useContext, useState, useEffect } from 'react'

const CacheContext = createContext()

const PRODUCTS_CACHE_KEY = 'cached_products'
const CACHE_TIMESTAMP_KEY = 'products_cache_timestamp'
const CACHE_DURATION = 5 * 60 * 1000
const SEARCH_HISTORY_KEY = 'search_history'

export function CacheProvider({ children }) {
  const [recentSearches, setRecentSearches] = useState([])
  const [filterCache, setFilterCache] = useState({ category: '', search: '' })

  useEffect(() => {
    const savedSearches = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (savedSearches) {
      try { setRecentSearches(JSON.parse(savedSearches)) } catch (e) {}
    }
    const savedFilter = sessionStorage.getItem('filter_cache')
    if (savedFilter) {
      try { setFilterCache(JSON.parse(savedFilter)) } catch (e) {}
    }
  }, [])

  const addRecentSearch = (query) => {
    if (!query.trim()) return
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== query)
      const newHistory = [query, ...filtered].slice(0, 3)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const updateFilterCache = (type, value) => {
    const newCache = { ...filterCache, [type]: value }
    setFilterCache(newCache)
    sessionStorage.setItem('filter_cache', JSON.stringify(newCache))
  }

  const getCachedProducts = () => {
    const cached = localStorage.getItem(PRODUCTS_CACHE_KEY)
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    if (cached && timestamp) {
      const now = Date.now()
      if (now - parseInt(timestamp) < CACHE_DURATION) {
        return JSON.parse(cached)
      }
    }
    return null
  }

  const setCachedProducts = (products) => {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  }

  // Call this whenever products change (add/edit/delete)
  const clearProductCache = () => {
    localStorage.removeItem(PRODUCTS_CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
  }

  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    if (!timestamp) return false
    return Date.now() - parseInt(timestamp) < CACHE_DURATION
  }

  return (
    <CacheContext.Provider value={{
      recentSearches,
      addRecentSearch,
      filterCache,
      updateFilterCache,
      getCachedProducts,
      setCachedProducts,
      clearProductCache,
      isCacheValid,
    }}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (!context) throw new Error('useCache must be used within a CacheProvider')
  return context
}
