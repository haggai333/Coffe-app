// Global error handler — catches any unhandled errors from routes
export function errorHandler(err, req, res, next) {
  console.error(' Server Error:', err.message)
  res.status(500).json({
    error: 'Internal server error',
    // Only show details in development
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  })
}

// Simple request logger — logs method, URL, and response time
export function requestLogger(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    const status = res.statusCode
    const color = status >= 400 ? '\x1b[31m' : '\x1b[32m' // red for errors, green for OK
    console.log(`${color}${req.method} ${req.url} → ${status} (${ms}ms)\x1b[0m`)
  })
  next()
}