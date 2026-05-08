// Sanitiza texto para prevenir XSS
export function sanitizeText(text) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim()
}

// Valida email
export function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(String(email).toLowerCase())
}

// Valida contraseña fuerte
export function validatePassword(password) {
  const errors = []
  if (password.length < 8) errors.push('Mínimo 8 caracteres')
  if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula')
  if (!/[0-9]/.test(password)) errors.push('Al menos un número')
  return errors
}

// Rate limiting simple en memoria
const attempts = new Map()

export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const record = attempts.get(key) || { count: 0, resetAt: now + windowMs }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + windowMs
  }

  record.count++
  attempts.set(key, record)

  return record.count <= maxAttempts
}

// Mensaje de error seguro (no filtra info sensible)
export function safeErrorMessage(error) {
  const safeMessages = {
    'Invalid login credentials': 'Correo o contraseña incorrectos',
    'Email not confirmed': 'Debés confirmar tu correo antes de iniciar sesión',
    'User already registered': 'Ya existe una cuenta con ese correo',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres',
  }

  if (!error) return 'Ocurrió un error inesperado'
  const msg = error.message || error
  return safeMessages[msg] || 'Ocurrió un error. Intentá de nuevo.'
}

// Valida nombre (solo letras y espacios)
export function validateName(name) {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(name.trim())
}

// Valida precio
export function validatePrice(price) {
  const num = parseFloat(price)
  return !isNaN(num) && num >= 0 && num <= 10000000
}

// Valida stock
export function validateStock(stock) {
  const num = parseInt(stock)
  return !isNaN(num) && num >= 0 && num <= 99999
}